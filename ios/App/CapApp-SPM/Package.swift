// swift-tools-version: 5.9
import PackageDescription

// Clone-safe dependency graph. Capacitor sync may regenerate node_modules-backed
// paths; scripts/patch-capapp-spm-vendored-packages.mjs restores this shape.
let package = Package(
    name: "CapApp-SPM",
    platforms: [.iOS(.v15)],
    products: [
        .library(name: "CapApp-SPM", targets: ["CapApp-SPM"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", exact: "8.4.2"),
        .package(url: "https://github.com/ionic-team/capacitor-keyboard.git", exact: "8.0.3"),
        .package(name: "CapacitorSplashScreen", path: "../Vendor/CapacitorSplashScreen"),
        .package(name: "CapacitorStatusBar", path: "../Vendor/CapacitorStatusBar"),
        .package(name: "CapawesomeCapacitorAppleSignIn", path: "../Vendor/CapawesomeCapacitorAppleSignIn"),
    ],
    targets: [
        .target(
            name: "CapApp-SPM",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm"),
                .product(name: "CapacitorKeyboard", package: "capacitor-keyboard"),
                .product(name: "CapacitorSplashScreen", package: "CapacitorSplashScreen"),
                .product(name: "CapacitorStatusBar", package: "CapacitorStatusBar"),
                .product(name: "CapawesomeCapacitorAppleSignIn", package: "CapawesomeCapacitorAppleSignIn"),
            ]
        )
    ]
)
