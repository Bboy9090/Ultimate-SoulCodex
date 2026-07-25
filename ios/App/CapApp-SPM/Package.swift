// swift-tools-version: 5.9
import PackageDescription

// Managed by Capacitor CLI commands and
// scripts/patch-capapp-spm-vendored-packages.mjs.
// All native package references must be resolvable immediately after clone.
let package = Package(
    name: "CapApp-SPM",
    platforms: [.iOS(.v15)],
    products: [
        .library(
            name: "CapApp-SPM",
            targets: ["CapApp-SPM"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", exact: "8.4.2"),
        .package(url: "https://github.com/ionic-team/capacitor-keyboard.git", exact: "8.0.3"),
        .package(name: "CapacitorSplashScreen", path: "../Vendor/CapacitorSplashScreen"),
        .package(name: "CapacitorStatusBar", path: "../Vendor/CapacitorStatusBar"),
        .package(name: "CapawesomeCapacitorAppleSignIn", path: "../Vendor/CapawesomeCapacitorAppleSignIn")
    ],
    targets: [
        .target(
            name: "CapApp-SPM",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm"),
                .product(name: "CapawesomeCapacitorAppleSignIn", package: "CapawesomeCapacitorAppleSignIn")
            ]
        )
    ]
)
