import Foundation
import StoreKit
import Capacitor

@objc(SoulCodexNativeBillingPlugin)
public class SoulCodexNativeBillingPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "SoulCodexNativeBillingPlugin"
    public let jsName = "SoulCodexNativeBilling"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "getProducts", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "purchase", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "restore", returnType: CAPPluginReturnPromise)
    ]

    @objc func getProducts(_ call: CAPPluginCall) {
        let productIds = call.getArray("productIds", String.self) ?? []
        guard !productIds.isEmpty else {
            call.reject("productIds are required", "native_billing_product_ids_required")
            return
        }

        Task {
            do {
                let products = try await Product.products(for: productIds)
                let payload = products.map { product in
                    [
                        "id": product.id,
                        "title": product.displayName,
                        "description": product.description,
                        "displayPrice": product.displayPrice
                    ] as [String : Any]
                }
                call.resolve(["products": payload])
            } catch {
                call.reject("Unable to load App Store products", "native_billing_products_failed", error)
            }
        }
    }

    @objc func purchase(_ call: CAPPluginCall) {
        guard let productId = call.getString("productId"), !productId.isEmpty else {
            call.reject("productId is required", "native_billing_product_id_required")
            return
        }

        Task {
            do {
                guard let product = try await Product.products(for: [productId]).first else {
                    call.reject("Product is unavailable", "native_billing_product_unavailable")
                    return
                }

                var options = Set<Product.PurchaseOption>()
                if let rawToken = call.getString("appAccountToken"),
                   let token = UUID(uuidString: rawToken) {
                    options.insert(.appAccountToken(token))
                }

                let result = try await product.purchase(options: options)
                switch result {
                case .success(let verification):
                    guard case .verified(let transaction) = verification else {
                        call.reject("App Store transaction was not verified", "native_billing_unverified_transaction")
                        return
                    }

                    let signedTransaction = verification.jwsRepresentation
                    let payload: [String: Any] = [
                        "platform": "ios",
                        "productId": transaction.productID,
                        "transactionId": String(transaction.id),
                        "signedTransaction": signedTransaction
                    ]
                    await transaction.finish()
                    call.resolve(payload)

                case .pending:
                    call.reject("Purchase is pending approval", "native_billing_pending")

                case .userCancelled:
                    call.reject("Purchase was cancelled", "native_billing_cancelled")

                @unknown default:
                    call.reject("Unknown App Store purchase result", "native_billing_unknown_result")
                }
            } catch {
                call.reject("App Store purchase failed", "native_billing_purchase_failed", error)
            }
        }
    }

    @objc func restore(_ call: CAPPluginCall) {
        let allowedIds = Set(call.getArray("productIds", String.self) ?? [])

        Task {
            do {
                try await AppStore.sync()
                var transactions: [[String: Any]] = []

                for await verification in Transaction.currentEntitlements {
                    guard case .verified(let transaction) = verification else { continue }
                    if !allowedIds.isEmpty && !allowedIds.contains(transaction.productID) { continue }

                    transactions.append([
                        "platform": "ios",
                        "productId": transaction.productID,
                        "transactionId": String(transaction.id),
                        "signedTransaction": verification.jwsRepresentation
                    ])
                }

                call.resolve(["transactions": transactions])
            } catch {
                call.reject("Unable to restore App Store purchases", "native_billing_restore_failed", error)
            }
        }
    }
}
