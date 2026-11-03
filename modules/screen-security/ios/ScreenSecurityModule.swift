import ExpoModulesCore
import LocalAuthentication
import UIKit

internal class BiometricsNotEnrolledException: Exception {
  override var code: String { "BIOMETRICS_NOT_ENROLLED" }
  override var reason: String { "No biometrics are set up on this device." }
}

public class ScreenSecurityModule: Module {
  private var screenshotObserver: NSObjectProtocol?

  public func definition() -> ModuleDefinition {
    Name("ScreenSecurity")

    Events("onScreenshotTaken")

    // Only listen while JS has a subscriber.
    OnStartObserving {
      guard self.screenshotObserver == nil else { return }
      self.screenshotObserver = NotificationCenter.default.addObserver(
        forName: UIApplication.userDidTakeScreenshotNotification,
        object: nil,
        queue: .main
      ) { [weak self] _ in
        self?.sendEvent("onScreenshotTaken")
      }
    }

    OnStopObserving {
      if let observer = self.screenshotObserver {
        NotificationCenter.default.removeObserver(observer)
        self.screenshotObserver = nil
      }
    }

    // Stable per vendor (app publisher) install; resets only when every app from the vendor is removed.
    Function("getDeviceId") { () -> String in
      return UIDevice.current.identifierForVendor?.uuidString ?? ""
    }

    // Resolves true on success and false on cancel/failure; throws BIOMETRICS_NOT_ENROLLED
    // when the device has no usable biometrics set up.
    AsyncFunction("isBiometricAuthenticated") { (promise: Promise) in
      let context = LAContext()
      var error: NSError?
      guard context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) else {
        throw BiometricsNotEnrolledException()
      }
      context.evaluatePolicy(
        .deviceOwnerAuthenticationWithBiometrics,
        localizedReason: "Authenticate to approve this payout"
      ) { success, _ in
        promise.resolve(success)
      }
    }
  }
}
