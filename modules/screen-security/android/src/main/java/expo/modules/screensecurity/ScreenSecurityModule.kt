package expo.modules.screensecurity

import android.annotation.SuppressLint
import android.provider.Settings
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

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
  }
}
