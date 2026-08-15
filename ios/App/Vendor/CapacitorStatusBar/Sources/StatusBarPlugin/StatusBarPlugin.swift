import Foundation
import Capacitor
import UIKit

@objc(StatusBarPlugin)
public class StatusBarPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "StatusBarPlugin"
    public let jsName = "StatusBar"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "setStyle", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "setBackgroundColor", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "show", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "hide", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getInfo", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "setOverlaysWebView", returnType: CAPPluginReturnPromise)
    ]
    private var statusBar: StatusBar?
    private let statusBarVisibilityChanged = "statusBarVisibilityChanged"
    private let statusBarOverlayChanged = "statusBarOverlayChanged"

    override public func load() {
        guard let bridge = bridge else { return }
        statusBar = StatusBar(bridge: bridge, config: statusBarConfig())
    }

    private func statusBarConfig() -> StatusBarConfig {
        var config = StatusBarConfig()
        let pluginConfig = getConfig()
        config.overlaysWebView = pluginConfig.getBoolean("overlaysWebView", config.overlaysWebView)

        if let colorConfig = configString("backgroundColor"),
           let color = Self.color(fromHex: colorConfig) {
            config.backgroundColor = color
        }
        if let configStyle = configString("style") {
            config.style = style(fromString: configStyle)
        }
        return config
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

    private func style(fromString: String) -> UIStatusBarStyle {
        switch fromString.lowercased() {
        case "dark", "lightcontent":
            return .lightContent
        case "light", "darkcontent":
            return .darkContent
        case "default":
            return .default
        default:
            return .default
        }
    }

    @objc func setStyle(_ call: CAPPluginCall) {
        let options = call.options!
        if let styleString = options["style"] as? String {
            statusBar?.setStyle(style(fromString: styleString))
        }
        call.resolve([:])
    }

    @objc func setBackgroundColor(_ call: CAPPluginCall) {
        guard let hexString = call.options["color"] as? String else {
            call.reject("A status bar color is required.")
            return
        }
        guard let color = Self.color(fromHex: hexString) else {
            call.reject("Invalid status bar color. Use #RRGGBB or #RRGGBBAA.")
            return
        }
        DispatchQueue.main.async { [weak self] in
            self?.statusBar?.setBackgroundColor(color)
        }
        call.resolve()
    }

    @objc func hide(_ call: CAPPluginCall) {
        let animation = call.getString("animation", "FADE")
        DispatchQueue.main.async { [weak self] in
            self?.statusBar?.hide(animation: animation)
            guard
                let info = self?.statusBar?.getInfo(),
                let dict = self?.toDict(info),
                let event = self?.statusBarVisibilityChanged
            else { return }
            self?.notifyListeners(event, data: dict)
        }
        call.resolve()
    }

    @objc func show(_ call: CAPPluginCall) {
        let animation = call.getString("animation", "FADE")
        DispatchQueue.main.async { [weak self] in
            self?.statusBar?.show(animation: animation)
            guard
                let info = self?.statusBar?.getInfo(),
                let dict = self?.toDict(info),
                let event = self?.statusBarVisibilityChanged
            else { return }
            self?.notifyListeners(event, data: dict)
        }
        call.resolve()
    }

    @objc func getInfo(_ call: CAPPluginCall) {
        DispatchQueue.main.async { [weak self] in
            guard
                let info = self?.statusBar?.getInfo(),
                let dict = self?.toDict(info)
            else { return }
            call.resolve(dict)
        }
    }

    @objc func setOverlaysWebView(_ call: CAPPluginCall) {
        guard let overlay = call.options["overlay"] as? Bool else {
            call.reject("The overlay value is required.")
            return
        }
        DispatchQueue.main.async { [weak self] in
            self?.statusBar?.setOverlaysWebView(overlay)
            guard
                let info = self?.statusBar?.getInfo(),
                let dict = self?.toDict(info),
                let event = self?.statusBarOverlayChanged
            else { return }
            self?.notifyListeners(event, data: dict)
        }
        call.resolve()
    }

    private func toDict(_ info: StatusBarInfo) -> [String: Any] {
        return [
            "visible": info.visible!,
            "style": info.style!,
            "color": info.color!,
            "overlays": info.overlays!,
            "height": info.height!
        ]
    }
}
