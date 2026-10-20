import Foundation

enum SoulCodexSessionPolicy {
    static func permits(_ url: URL) -> Bool {
        guard url.scheme == "https", url.host == "soulcodex.up.railway.app",
              url.port == nil || url.port == 443,
              url.user == nil, url.password == nil else { return false }
        return url.path == "/api/user" || url.path == "/api/access" ||
            url.path.hasPrefix("/api/auth/") || url.path.hasPrefix("/api/billing/")
    }

    static func cookies(from response: HTTPURLResponse) -> [HTTPCookie] {
        guard let url = response.url else { return [] }
        var headers: [String: String] = [:]
        for (key, value) in response.allHeaderFields {
            headers[String(describing: key)] = String(describing: value)
        }
        // Foundation parses the complete header, including commas in Expires.
        return HTTPCookie.cookies(withResponseHeaderFields: headers, for: url)
    }
}
