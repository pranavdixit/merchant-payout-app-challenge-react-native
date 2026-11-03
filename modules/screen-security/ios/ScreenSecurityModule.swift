import ExpoModulesCore
import UIKit

public class ScreenSecurityModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ScreenSecurity")

    // Stable per vendor (app publisher) install; resets only when every app from the vendor is removed.
    Function("getDeviceId") { () -> String in
      return UIDevice.current.identifierForVendor?.uuidString ?? ""
    }
  }
}
