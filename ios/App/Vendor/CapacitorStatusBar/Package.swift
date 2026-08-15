// swift-tools-version: 5.9
import PackageDescription

// Vendored from @capacitor/status-bar 8.0.2 (MIT) so Xcode Cloud can
// resolve this native plugin immediately after cloning the repository.
let package = Package(
    name: "CapacitorStatusBar",
    platforms: [.iOS(.v15)],
    products: [
        .library(
            name: "CapacitorStatusBar",
            targets: ["StatusBarPlugin"])
    ],
    dependencies: [
        .package(
            url: "https://github.com/ionic-team/capacitor-swift-pm.git",
            exact: "8.4.2")
    ],
    targets: [
        .target(
            name: "StatusBarPlugin",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm")
            ],
            path: "Sources/StatusBarPlugin")
    ]
)
