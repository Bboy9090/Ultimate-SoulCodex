// swift-tools-version: 5.9
import PackageDescription

// Vendored from @capawesome/capacitor-apple-sign-in 0.1.2 (MIT).
// Kept in-repository so Xcode Cloud can resolve native dependencies before
// JavaScript dependencies and custom build scripts are available.
let package = Package(
    name: "CapawesomeCapacitorAppleSignIn",
    platforms: [.iOS(.v15)],
    products: [
        .library(
            name: "CapawesomeCapacitorAppleSignIn",
            targets: ["AppleSignInPlugin"]
        )
    ],
    dependencies: [
        .package(
            url: "https://github.com/ionic-team/capacitor-swift-pm.git",
            exact: "8.4.2"
        )
    ],
    targets: [
        .target(
            name: "AppleSignInPlugin",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm")
            ],
            path: "Sources/AppleSignInPlugin"
        )
    ]
)
