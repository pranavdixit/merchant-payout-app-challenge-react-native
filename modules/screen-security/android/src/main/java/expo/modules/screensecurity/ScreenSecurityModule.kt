package expo.modules.screensecurity

import android.annotation.SuppressLint
import android.provider.Settings
import androidx.biometric.BiometricManager
import androidx.biometric.BiometricManager.Authenticators.BIOMETRIC_STRONG
import androidx.biometric.BiometricPrompt
import androidx.core.content.ContextCompat
import androidx.fragment.app.FragmentActivity
import expo.modules.kotlin.Promise
import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.functions.Queues
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

private const val NOT_ENROLLED = "BIOMETRICS_NOT_ENROLLED"

class ScreenSecurityModule : Module() {
  private val context
    get() = appContext.reactContext ?: throw Exceptions.ReactContextLost()

  override fun definition() = ModuleDefinition {
    Name("ScreenSecurity")

    // Scoped to the app signing key, user and device; survives reinstalls, resets on factory reset.
    Function("getDeviceId") {
      @SuppressLint("HardwareIds")
      Settings.Secure.getString(context.contentResolver, Settings.Secure.ANDROID_ID) ?: ""
    }

    // Resolves true on success and false on cancel/failure; rejects with BIOMETRICS_NOT_ENROLLED
    // when the device has no usable biometrics set up.
    AsyncFunction("isBiometricAuthenticated") { promise: Promise ->
      val activity = appContext.currentActivity as? FragmentActivity
        ?: throw Exceptions.MissingActivity()

      if (BiometricManager.from(activity).canAuthenticate(BIOMETRIC_STRONG) !=
        BiometricManager.BIOMETRIC_SUCCESS
      ) {
        throw CodedException(NOT_ENROLLED, "No biometrics are set up on this device.", null)
      }

      val callback = object : BiometricPrompt.AuthenticationCallback() {
        override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) {
          promise.resolve(true)
        }

        // Terminal errors only (cancel, lockout, ...); a wrong finger is retried by the prompt itself.
        override fun onAuthenticationError(errorCode: Int, errString: CharSequence) {
          promise.resolve(false)
        }
      }

      val info = BiometricPrompt.PromptInfo.Builder()
        .setTitle("Confirm payout")
        .setSubtitle("Authenticate to approve this payout")
        .setAllowedAuthenticators(BIOMETRIC_STRONG)
        .setNegativeButtonText("Cancel")
        .build()

      BiometricPrompt(activity, ContextCompat.getMainExecutor(activity), callback).authenticate(info)
    }.runOnQueue(Queues.MAIN)
  }
}
