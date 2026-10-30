import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path: string) => readFileSync(path, "utf8");

test("iOS 27 launch uses a registered single-window scene instead of legacy application startup", () => {
  const plist = read("ios/App/App/Info.plist");
  const project = read("ios/App/App.xcodeproj/project.pbxproj");
  const delegate = read("ios/App/App/AppDelegate.swift");
  assert.match(plist, /<key>UIApplicationSceneManifest<\/key>/);
  assert.match(plist, /<key>UIApplicationSupportsMultipleScenes<\/key>\s*<false\/>/);
  assert.match(plist, /<key>UIWindowSceneSessionRoleApplication<\/key>/);
  assert.match(plist, /\$\(PRODUCT_MODULE_NAME\)\.SceneDelegate/);
  assert.doesNotMatch(plist, /<key>UIMainStoryboardFile<\/key>|<key>UISceneStoryboardFile<\/key>/);
  assert.match(delegate, /configurationForConnecting connectingSceneSession: UISceneSession/);
  assert.match(delegate, /configuration\.delegateClass = SceneDelegate\.self/);
  assert.match(project, /SceneDelegate\.swift in Sources \*\/ = \{isa = PBXBuildFile/);
  assert.match(project, /A11B1AA12E00000000000009 \/\* SceneDelegate\.swift in Sources \*\/,/);
  assert.match(project, /A11B1AA12E0000000000000A \/\* SceneDelegate\.swift \*\/,/);
});

test("scene startup preserves the custom native bridge and forwards cold and warm links", () => {
  const scene = read("ios/App/App/SceneDelegate.swift");
  assert.match(scene, /guard session\.role == \.windowApplication/);
  assert.match(scene, /UIWindow\(windowScene: windowScene\)/);
  assert.match(scene, /rootViewController = SoulCodexBridgeViewController\(\)/);
  assert.match(scene, /appWindow\.makeKeyAndVisible\(\)/);
  assert.match(scene, /SceneDelegateProxy\.shared\.scene\(scene, willConnectTo: session, options: connectionOptions\)/);
  assert.match(scene, /SceneDelegateProxy\.shared\.scene\(scene, openURLContexts: URLContexts\)/);
  assert.match(scene, /SceneDelegateProxy\.shared\.scene\(scene, continue: userActivity\)/);
  const packages = JSON.parse(read("package.json")).dependencies;
  for (const name of ["@capacitor/core", "@capacitor/ios", "@capacitor/android", "@capacitor/cli"]) {
    assert.equal(packages[name], "8.6.0");
  }
  for (const path of ["ios/App/CapApp-SPM/Package.swift", "ios/App/Vendor/CapacitorSplashScreen/Package.swift", "ios/App/Vendor/CapacitorStatusBar/Package.swift", "ios/App/Vendor/CapawesomeCapacitorAppleSignIn/Package.swift"]) {
    assert.match(read(path), /exact: "8\.6\.0"/);
  }
});

test("launch qualification covers iPhone and iPad on the reviewed OS and rejects scene traps", () => {
  const workflow = read(".github/workflows/ios-4.0.2-native-load-hotfix.yml");
  assert.match(workflow, /device: \[iPhone, iPad\]/);
  assert.match(workflow, /DeviceHub\.app/);
  assert.match(workflow, /xcode-select/);
  assert.doesNotMatch(workflow, /"open", "-a", "Simulator"/);
  assert.match(workflow, /iOS-27-0/);
  assert.match(workflow, /iPad Air/);
  assert.match(workflow, /"simctl", "create", device_name, device_type, runtime/);
  assert.match(workflow, /SIMULATOR_CREATION_RETURNED_NO_UDID/);
  assert.match(workflow, /simctl delete "\$SIMULATOR_UDID"/);
  assert.doesNotMatch(workflow, /"simctl", "shutdown", "all"/);
  assert.match(workflow, /timeout=300, check=True/);
  assert.match(workflow, /"ps", "-p", launched_pid, "-o", "comm="/);
  assert.match(workflow, /APP_PROCESS_DID_NOT_SURVIVE_LAUNCH/);
  assert.doesNotMatch(workflow, /"launchctl", "list"/);
  assert.match(workflow, /NO_AVAILABLE_IOS27_SIMULATOR_FOR_REQUESTED_FAMILY/);
  assert.match(workflow, /SIGTRAP\|NoSceneLifecycleAdoption\|UIScene life cycle is required/);
  assert.match(workflow, /soulcodex-4\.1\.0-ios-launch-proof-\$\{\{ matrix\.device \}\}/);
});
