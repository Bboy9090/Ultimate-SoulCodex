// swift-tools-version: 5.9
import PackageDescription

// Vendored from @capacitor/splash-screen 8.0.1 (MIT) so Xcode Cloud can
// resolve this native plugin immediately after cloning the repository.
let package = Package(
    name: "CapacitorSplashScreen",
    platforms: [.iOS(.v15)],
    products: [
        .library(
            name: "CapacitorSplashScreen",
            targets: ["SplashScreenPlugin"])
    ],
    dependencies: [
        .package(
            url: "https://github.com/ionic-team/capacitor-swift-pm.git",
            exact: "8.4.2")
    ],
    targets: [
        .target(
            name: "SplashScreenPlugin",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm")
            ],
            path: "Sources/SplashScreenPlugin")
    ]
)
