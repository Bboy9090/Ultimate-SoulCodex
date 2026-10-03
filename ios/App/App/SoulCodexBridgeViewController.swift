import Capacitor

class SoulCodexBridgeViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(SoulCodexNativeBillingPlugin())
    }
}
