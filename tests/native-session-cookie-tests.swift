import Foundation

@main
enum SessionCookieTests {
    static func main() {
        let url = URL(string: "https://soulcodex.up.railway.app/api/auth/apple")!
        let expiry = Date().addingTimeInterval(7 * 24 * 60 * 60)
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "en_US_POSIX")
        formatter.timeZone = TimeZone(secondsFromGMT: 0)
        formatter.dateFormat = "EEE, dd MMM yyyy HH:mm:ss 'GMT'"
        let response = HTTPURLResponse(url: url, statusCode: 200, httpVersion: nil, headerFields: [
            "Set-Cookie": "connect.sid=test-only; Path=/; Expires=\(formatter.string(from: expiry)); HttpOnly; Secure; SameSite=None"
        ])!
        let cookies = SoulCodexSessionPolicy.cookies(from: response)
        precondition(cookies.count == 1)
        let cookie = cookies[0]
        precondition(cookie.name == "connect.sid" && cookie.value == "test-only")
        precondition(cookie.isSecure && cookie.isHTTPOnly && !cookie.isSessionOnly)
        precondition(abs(cookie.expiresDate!.timeIntervalSince(expiry)) < 2)

        let storage = HTTPCookieStorage.shared
        storage.setCookie(cookie)
        defer { storage.deleteCookie(cookie) }
        let first = URLSession(configuration: .default)
        first.invalidateAndCancel()
        let next = URLSession(configuration: .default)
        defer { next.invalidateAndCancel() }
        let retained = next.configuration.httpCookieStorage?.cookies(for: url)?.first { $0.name == "connect.sid" }
        precondition(retained?.isSessionOnly == false)
        precondition(retained?.expiresDate == cookie.expiresDate)
        let logout = HTTPURLResponse(url: url, statusCode: 200, httpVersion: nil, headerFields: [
            "Set-Cookie": "connect.sid=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure"
        ])!
        for expired in SoulCodexSessionPolicy.cookies(from: logout) { storage.setCookie(expired) }
        precondition(storage.cookies(for: url)?.contains { $0.name == "connect.sid" } != true)
        precondition(SoulCodexSessionPolicy.permits(url))
        for blocked in ["http://soulcodex.up.railway.app/api/auth/user", "https://evil.test/api/auth/user",
                        "https://soulcodex.up.railway.app.evil.test/api/auth/user",
                        "https://soulcodex.up.railway.app:444/api/auth/user",
                        "https://soulcodex.up.railway.app/api/pdf/example"] {
            precondition(!SoulCodexSessionPolicy.permits(URL(string: blocked)!))
        }
        print("Foundation session-cookie expiry, session reuse, logout and destination tests passed.")
    }
}
