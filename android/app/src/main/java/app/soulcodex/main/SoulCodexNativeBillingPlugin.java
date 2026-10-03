package app.soulcodex.main;

import android.app.Activity;

import com.android.billingclient.api.AcknowledgePurchaseParams;
import com.android.billingclient.api.BillingClient;
import com.android.billingclient.api.BillingClientStateListener;
import com.android.billingclient.api.BillingFlowParams;
import com.android.billingclient.api.BillingResult;
import com.android.billingclient.api.PendingPurchasesParams;
import com.android.billingclient.api.ProductDetails;
import com.android.billingclient.api.Purchase;
import com.android.billingclient.api.PurchasesUpdatedListener;
import com.android.billingclient.api.QueryProductDetailsParams;
import com.android.billingclient.api.QueryPurchasesParams;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@CapacitorPlugin(name = "SoulCodexNativeBilling")
public class SoulCodexNativeBillingPlugin extends Plugin implements PurchasesUpdatedListener {
    private BillingClient billingClient;
    private PluginCall pendingPurchaseCall;
    private String pendingProductId;

    @Override
    public void load() {
        PendingPurchasesParams pendingPurchasesParams =
            PendingPurchasesParams.newBuilder().enableOneTimeProducts().build();

        billingClient = BillingClient.newBuilder(getContext())
            .setListener(this)
            .enablePendingPurchases(pendingPurchasesParams)
            .build();
    }

    private void withReadyClient(PluginCall call, Runnable action) {
        if (billingClient != null && billingClient.isReady()) {
            action.run();
            return;
        }

        if (billingClient == null) {
            call.reject("Google Play Billing is unavailable", "native_billing_unavailable");
            return;
        }

        billingClient.startConnection(new BillingClientStateListener() {
            @Override
            public void onBillingSetupFinished(BillingResult billingResult) {
                if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK) {
                    action.run();
                } else {
                    call.reject("Google Play Billing setup failed", "native_billing_setup_failed");
                }
            }

            @Override
            public void onBillingServiceDisconnected() {
                // The next operation reconnects through withReadyClient.
            }
        });
    }

    private List<String> productIds(PluginCall call) {
        List<String> result = new ArrayList<>();
        JSArray array = call.getArray("productIds");
        if (array == null) return result;
        try {
            for (Object value : array.toList()) {
                if (value instanceof String && !((String) value).isEmpty()) {
                    result.add((String) value);
                }
            }
        } catch (Exception ignored) {}
        return result;
    }

    private QueryProductDetailsParams detailsParams(List<String> ids) {
        List<QueryProductDetailsParams.Product> products = new ArrayList<>();
        for (String id : ids) {
            products.add(
                QueryProductDetailsParams.Product.newBuilder()
                    .setProductId(id)
                    .setProductType(BillingClient.ProductType.SUBS)
                    .build()
            );
        }
        return QueryProductDetailsParams.newBuilder().setProductList(products).build();
    }

    @PluginMethod
    public void getProducts(PluginCall call) {
        List<String> ids = productIds(call);
        if (ids.isEmpty()) {
            call.reject("productIds are required", "native_billing_product_ids_required");
            return;
        }

        withReadyClient(call, () ->
            billingClient.queryProductDetailsAsync(detailsParams(ids), (billingResult, result) -> {
                if (billingResult.getResponseCode() != BillingClient.BillingResponseCode.OK) {
                    call.reject("Unable to load Google Play products", "native_billing_products_failed");
                    return;
                }

                JSArray products = new JSArray();
                for (ProductDetails details : result.getProductDetailsList()) {
                    JSObject item = new JSObject();
                    item.put("id", details.getProductId());
                    item.put("title", details.getTitle());
                    item.put("description", details.getDescription());

                    List<ProductDetails.SubscriptionOfferDetails> offers =
                        details.getSubscriptionOfferDetails();
                    if (offers != null && !offers.isEmpty()) {
                        List<ProductDetails.PricingPhase> phases =
                            offers.get(0).getPricingPhases().getPricingPhaseList();
                        if (!phases.isEmpty()) {
                            ProductDetails.PricingPhase phase = phases.get(0);
                            item.put("displayPrice", phase.getFormattedPrice());
                            item.put("priceMicros", phase.getPriceAmountMicros());
                            item.put("currencyCode", phase.getPriceCurrencyCode());
                        }
                    }
                    products.put(item);
                }

                JSObject response = new JSObject();
                response.put("products", products);
                call.resolve(response);
            })
        );
    }

    @PluginMethod
    public void purchase(PluginCall call) {
        String productId = call.getString("productId");
        if (productId == null || productId.isEmpty()) {
            call.reject("productId is required", "native_billing_product_id_required");
            return;
        }

        withReadyClient(call, () ->
            billingClient.queryProductDetailsAsync(
                detailsParams(Collections.singletonList(productId)),
                (billingResult, result) -> {
                    if (
                        billingResult.getResponseCode() != BillingClient.BillingResponseCode.OK ||
                        result.getProductDetailsList().isEmpty()
                    ) {
                        call.reject("Product is unavailable", "native_billing_product_unavailable");
                        return;
                    }

                    ProductDetails details = result.getProductDetailsList().get(0);
                    List<ProductDetails.SubscriptionOfferDetails> offers =
                        details.getSubscriptionOfferDetails();
                    if (offers == null || offers.isEmpty()) {
                        call.reject("No subscription offer is available", "native_billing_offer_unavailable");
                        return;
                    }

                    ProductDetails.SubscriptionOfferDetails offer = offers.get(0);
                    BillingFlowParams.ProductDetailsParams productParams =
                        BillingFlowParams.ProductDetailsParams.newBuilder()
                            .setProductDetails(details)
                            .setOfferToken(offer.getOfferToken())
                            .build();

                    BillingFlowParams.Builder flowBuilder =
                        BillingFlowParams.newBuilder()
                            .setProductDetailsParamsList(Collections.singletonList(productParams));

                    String accountToken = call.getString("appAccountToken");
                    if (accountToken != null && !accountToken.isEmpty()) {
                        flowBuilder.setObfuscatedAccountId(accountToken);
                    }

                    Activity activity = getActivity();
                    if (activity == null) {
                        call.reject("Billing activity is unavailable", "native_billing_activity_unavailable");
                        return;
                    }

                    pendingPurchaseCall = call;
                    pendingProductId = productId;
                    BillingResult launchResult =
                        billingClient.launchBillingFlow(activity, flowBuilder.build());

                    if (launchResult.getResponseCode() != BillingClient.BillingResponseCode.OK) {
                        pendingPurchaseCall = null;
                        pendingProductId = null;
                        call.reject("Google Play purchase could not start", "native_billing_purchase_start_failed");
                    }
                }
            )
        );
    }

    @Override
    public void onPurchasesUpdated(BillingResult billingResult, List<Purchase> purchases) {
        PluginCall call = pendingPurchaseCall;
        if (call == null) return;

        if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.USER_CANCELED) {
            pendingPurchaseCall = null;
            pendingProductId = null;
            call.reject("Purchase was cancelled", "native_billing_cancelled");
            return;
        }

        if (
            billingResult.getResponseCode() != BillingClient.BillingResponseCode.OK ||
            purchases == null ||
            purchases.isEmpty()
        ) {
            pendingPurchaseCall = null;
            pendingProductId = null;
            call.reject("Google Play purchase failed", "native_billing_purchase_failed");
            return;
        }

        Purchase purchase = purchases.get(0);
        if (purchase.getPurchaseState() != Purchase.PurchaseState.PURCHASED) {
            pendingPurchaseCall = null;
            pendingProductId = null;
            call.reject("Purchase is pending", "native_billing_pending");
            return;
        }

        JSObject response = new JSObject();
        response.put("platform", "android");
        response.put("productId", pendingProductId);
        response.put(
            "transactionId",
            purchase.getOrderId() != null ? purchase.getOrderId() : purchase.getPurchaseToken()
        );
        response.put("purchaseToken", purchase.getPurchaseToken());

        pendingPurchaseCall = null;
        pendingProductId = null;
        call.resolve(response);
    }

    @PluginMethod
    public void restore(PluginCall call) {
        List<String> allowedIds = productIds(call);

        withReadyClient(call, () -> {
            QueryPurchasesParams params =
                QueryPurchasesParams.newBuilder()
                    .setProductType(BillingClient.ProductType.SUBS)
                    .build();

            billingClient.queryPurchasesAsync(params, (billingResult, purchases) -> {
                if (billingResult.getResponseCode() != BillingClient.BillingResponseCode.OK) {
                    call.reject("Unable to restore Google Play purchases", "native_billing_restore_failed");
                    return;
                }

                JSArray transactions = new JSArray();
                for (Purchase purchase : purchases) {
                    if (purchase.getPurchaseState() != Purchase.PurchaseState.PURCHASED) continue;
                    for (String productId : purchase.getProducts()) {
                        if (!allowedIds.isEmpty() && !allowedIds.contains(productId)) continue;
                        JSObject item = new JSObject();
                        item.put("platform", "android");
                        item.put("productId", productId);
                        item.put(
                            "transactionId",
                            purchase.getOrderId() != null ? purchase.getOrderId() : purchase.getPurchaseToken()
                        );
                        item.put("purchaseToken", purchase.getPurchaseToken());
                        transactions.put(item);
                    }
                }

                JSObject response = new JSObject();
                response.put("transactions", transactions);
                call.resolve(response);
            });
        });
    }
}
