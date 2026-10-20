import Foundation
import Capacitor
import WebKit

@objc(SoulCodexSessionHTTPPlugin)
public class SoulCodexSessionHTTPPlugin: CAPPlugin, CAPBridgedPlugin, URLSessionTaskDelegate {
    public let identifier = "SoulCodexSessionHTTPPlugin"
    public let jsName = "SoulCodexSessionHTTP"
    public let pluginMethods: [CAPPluginMethod] = [CAPPluginMethod(name: "request", returnType: CAPPluginReturnPromise)]

    @objc func request(_ call: CAPPluginCall) {
        guard let rawURL = call.getString("url"), let url = URL(string: rawURL),
              SoulCodexSessionPolicy.permits(url) else {
            call.reject("Account request destination is not permitted.")
            return
        }
        let method = call.getString("method", "GET").uppercased()
        guard ["GET", "POST", "DELETE", "HEAD"].contains(method) else {
            call.reject("Account request method is not permitted.")
            return
        }
        var request = URLRequest(url: url, cachePolicy: .reloadIgnoringLocalCacheData, timeoutInterval: 30)
        request.httpMethod = method
        let headers = call.getObject("headers") ?? [:]
        for (name, value) in headers {
            guard !["cookie", "host", "origin"].contains(name.lowercased()), let value = value as? String else { continue }
            request.setValue(value, forHTTPHeaderField: name)
        }
        request.setValue("capacitor://localhost", forHTTPHeaderField: "Origin")
        if let data = call.options["data"] {
            do {
                request.httpBody = try JSONSerialization.data(withJSONObject: data, options: [.fragmentsAllowed])
                request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            } catch {
                call.reject("Account request body must be valid JSON.")
                return
            }
        }
        let configuration = URLSessionConfiguration.default
        configuration.httpCookieStorage = HTTPCookieStorage.shared
        configuration.httpShouldSetCookies = true
        configuration.urlCache = nil
        let session = URLSession(configuration: configuration, delegate: self, delegateQueue: nil)
        session.dataTask(with: request) { data, response, error in
            defer { session.finishTasksAndInvalidate() }
            guard error == nil, let response = response as? HTTPURLResponse else {
                call.reject("Account connection failed. Please try again.")
                return
            }
            // Do not use CapacitorHttp's comma-splitting cookie rewrite.
            let responseCookies = SoulCodexSessionPolicy.cookies(from: response)
            for cookie in responseCookies {
                HTTPCookieStorage.shared.setCookie(cookie)
            }
            var responseHeaders: [String: String] = [:]
            for (key, value) in response.allHeaderFields {
                let name = String(describing: key)
                if !["set-cookie", "set-cookie2"].contains(name.lowercased()) {
                    responseHeaders[name] = String(describing: value)
                }
            }
            let payload: Any = data.flatMap { try? JSONSerialization.jsonObject(with: $0, options: [.fragmentsAllowed]) }
                ?? data.flatMap { String(data: $0, encoding: .utf8) } ?? ""
            let result: [String: Any] = ["status": response.statusCode, "headers": responseHeaders,
                                       "data": payload, "url": response.url?.absoluteString ?? rawURL]
            DispatchQueue.main.async {
                guard let cookieStore = self.bridge?.webView?.configuration.websiteDataStore.httpCookieStore else {
                    call.resolve(result)
                    return
                }
                let group = DispatchGroup()
                // Logout must also remove the old WebView copy, not just omit it
                // from the remaining native cookies copied below.
                for cookie in responseCookies where cookie.expiresDate.map({ $0 <= Date() }) == true {
                    group.enter()
                    cookieStore.delete(cookie) { group.leave() }
                }
                for cookie in HTTPCookieStorage.shared.cookies(for: url) ?? [] {
                    group.enter()
                    cookieStore.setCookie(cookie) { group.leave() }
                }
                group.notify(queue: .main) { call.resolve(result) }
            }
        }.resume()
    }

    public func urlSession(_ session: URLSession, task: URLSessionTask,
                           willPerformHTTPRedirection response: HTTPURLResponse,
                           newRequest request: URLRequest,
                           completionHandler: @escaping (URLRequest?) -> Void) {
        completionHandler(nil)
    }
}
