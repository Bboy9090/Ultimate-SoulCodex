package app.soulcodex.main;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(SoulCodexNativeBillingPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
