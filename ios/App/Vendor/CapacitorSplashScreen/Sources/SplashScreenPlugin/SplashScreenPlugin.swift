import Foundation
import Capacitor
import UIKit

@objc(SplashScreenPlugin)
public class SplashScreenPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "SplashScreenPlugin"
    public let jsName = "SplashScreen"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "show", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "hide", returnType: CAPPluginReturnPromise)
    ]
    private var splashScreen: SplashScreen?

    override public func load() {
        if let view = bridge?.viewController?.view {
            splashScreen = SplashScreen(parentView: view, config: splashScreenConfig())
            splashScreen?.showOnLaunch()
        }
    }

    @objc public func show(_ call: CAPPluginCall) {
        if let splash = splashScreen {
            let settings = splashScreenSettings(from: call)
            splash.show(settings: settings, completion: { call.resolve() })
        } else {
            call.reject("Unable to show Splash Screen")
        }
    }

    @objc public func hide(_ call: CAPPluginCall) {
        if let splash = splashScreen {
            let settings = splashScreenSettings(from: call)
            splash.hide(settings: settings)
            call.resolve()
        } else {
            call.reject("Unable to hide Splash Screen")
        }
    }

    private func splashScreenSettings(from call: CAPPluginCall) -> SplashScreenSettings {
        var settings = SplashScreenSettings()
        if let showDuration = call.getInt("showDuration") {
            settings.showDuration = showDuration
        }
        if let fadeInDuration = call.getInt("fadeInDuration") {
            settings.fadeInDuration = fadeInDuration
        }
        if let fadeOutDuration = call.getInt("fadeOutDuration") {
            settings.fadeOutDuration = fadeOutDuration
        }
        if let autoHide = call.getBool("autoHide") {
            settings.autoHide = autoHide
        }
        return settings
    }

    private func configString(_ key: String) -> String? {
        return getConfig().getConfigJSON()[key] as? String
    }

    private static func color(fromHex value: String) -> UIColor? {
        let hex = value
            .trimmingCharacters(in: .whitespacesAndNewlines)
            .replacingOccurrences(of: "#", with: "")

        guard hex.count == 6 || hex.count == 8,
              let raw = UInt64(hex, radix: 16) else {
            return nil
        }

        let red: CGFloat
        let green: CGFloat
        let blue: CGFloat
        let alpha: CGFloat

        if hex.count == 6 {
            red = CGFloat((raw >> 16) & 0xFF) / 255.0
            green = CGFloat((raw >> 8) & 0xFF) / 255.0
            blue = CGFloat(raw & 0xFF) / 255.0
            alpha = 1.0
        } else {
            red = CGFloat((raw >> 24) & 0xFF) / 255.0
            green = CGFloat((raw >> 16) & 0xFF) / 255.0
            blue = CGFloat((raw >> 8) & 0xFF) / 255.0
            alpha = CGFloat(raw & 0xFF) / 255.0
        }

        return UIColor(red: red, green: green, blue: blue, alpha: alpha)
    }

    private func splashScreenConfig() -> SplashScreenConfig {
        var config = SplashScreenConfig()

        if let backgroundColor = configString("backgroundColor") {
            config.backgroundColor = Self.color(fromHex: backgroundColor)
        }
        if let spinnerStyle = configString("iosSpinnerStyle") {
            switch spinnerStyle.lowercased() {
            case "small":
                config.spinnerStyle = .medium
            default:
                config.spinnerStyle = .large
            }
        }
        if let spinnerColor = configString("spinnerColor") {
            config.spinnerColor = Self.color(fromHex: spinnerColor)
        }
        config.showSpinner = getConfig().getBoolean("showSpinner", config.showSpinner)
        config.launchShowDuration = getConfig().getInt("launchShowDuration", config.launchShowDuration)
        config.launchAutoHide = getConfig().getBoolean("launchAutoHide", config.launchAutoHide)
        return config
    }
}
