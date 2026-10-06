// «إدارة المشروع» للآيفون: واجهة البرنامج نفسه من كمبيوترك عبر الواي فاي.
// لا بيانات داخل التطبيق: كل شيء في قاعدة الكمبيوتر. الربط مرة واحدة بتصوير رمز QR من شاشة الكمبيوتر.
import SwiftUI
import WebKit
import AVFoundation
import QuickLook

@main
struct PMApp: App {
    @StateObject private var store = LinkStore()
    var body: some Scene {
        WindowGroup {
            RootView()
                .environmentObject(store)
                .environment(\.layoutDirection, .rightToLeft)
        }
    }
}

// MARK: - عنوان الكمبيوتر المحفوظ

final class LinkStore: ObservableObject {
    @Published private(set) var base: URL?
    @Published private(set) var startURL: URL?
    @Published private(set) var loadToken = UUID()

    init() {
        base = UserDefaults.standard.url(forKey: "pm.base")
        startURL = base.flatMap { URL(string: $0.absoluteString + "/") }
    }

    /// عناوين الشبكة المحلية فقط: لا يُفتح موقع خارجي من صورة.
    static func isLocalHost(_ h: String) -> Bool {
        let host = h.lowercased()
        if host == "localhost" || host.hasSuffix(".local") { return true }
        let parts = host.split(separator: ".")
        let nums = parts.compactMap { Int($0) }
        guard parts.count == 4, nums.count == 4 else { return false }
        return nums[0] == 10 || nums[0] == 127 || (nums[0] == 192 && nums[1] == 168) || (nums[0] == 172 && (16...31).contains(nums[1]))
    }

    private static func baseOf(_ u: URL) -> URL? {
        guard let host = u.host, isLocalHost(host) else { return nil }
        var c = URLComponents()
        c.scheme = "http"; c.host = host; c.port = u.port ?? 8080
        return c.url
    }

    /// رابط رمز QR من الكمبيوتر (http://192.168.x.x:8080/#pair=123456) أو الرابط مكتوباً.
    @discardableResult
    func link(_ raw: String) -> Bool {
        var text = raw.trimmingCharacters(in: .whitespacesAndNewlines)
        if !text.lowercased().hasPrefix("http") { text = "http://" + text }
        guard let u = URL(string: text), u.scheme?.lowercased() == "http", let b = LinkStore.baseOf(u) else { return false }
        save(b)
        var start = b.absoluteString + "/"
        if let f = u.fragment, f.hasPrefix("pair=") { start += "#" + f }
        startURL = URL(string: start)
        loadToken = UUID()
        return true
    }

    /// الواجهة انتقلت بنفسها لعنوان كمبيوتر جديد (إعادة الربط من الإعدادات): نحفظه بلا إعادة تحميل.
    func adopt(_ u: URL) { if let b = LinkStore.baseOf(u), b != base { save(b) } }

    func reload() {
        startURL = base.flatMap { URL(string: $0.absoluteString + "/") }
        loadToken = UUID()
    }

    private func save(_ b: URL) {
        UserDefaults.standard.set(b, forKey: "pm.base")
        base = b
    }
}

struct RootView: View {
    @EnvironmentObject var store: LinkStore
    var body: some View {
        if let url = store.startURL {
            WebScreen(url: url, store: store).id(store.loadToken)
        } else {
            LinkView()
        }
    }
}

let brand = Color(red: 0x15 / 255, green: 0x36 / 255, blue: 0x5A / 255)

// MARK: - شاشة الربط الأولى

struct LinkView: View {
    @EnvironmentObject var store: LinkStore
    @State private var scanning = false
    @State private var manual = ""
    @State private var error: String?

    var body: some View {
        ScrollView {
            VStack(spacing: 18) {
                Image(systemName: "building.2.crop.circle.fill")
                    .font(.system(size: 72)).foregroundColor(brand).padding(.top, 40)
                Text("إدارة المشروع").font(.largeTitle.bold())
                Text("على الكمبيوتر: شغّل «تشغيل_الخادم» ثم اضغط «ربط جوال».\nالجوال والكمبيوتر على نفس الواي فاي.")
                    .multilineTextAlignment(.center).foregroundColor(.secondary)
                Button { scanning = true } label: {
                    Label("ربط بالكمبيوتر بالكاميرا", systemImage: "qrcode.viewfinder")
                        .font(.headline).frame(maxWidth: .infinity).padding(.vertical, 10)
                }
                .buttonStyle(.borderedProminent).tint(brand)
                VStack(alignment: .leading, spacing: 8) {
                    Text("أو اكتب الرابط الظاهر في الكمبيوتر").font(.subheadline).foregroundColor(.secondary)
                    TextField("http://192.168.1.20:8080", text: $manual)
                        .keyboardType(.URL).textInputAutocapitalization(.never).autocorrectionDisabled()
                        .textFieldStyle(.roundedBorder).environment(\.layoutDirection, .leftToRight)
                    Button("فتح") {
                        if !store.link(manual) { error = "الرابط غير صحيح. مثال: http://192.168.1.20:8080" }
                    }
                    .buttonStyle(.bordered)
                }
                if let e = error { Text(e).font(.footnote).foregroundColor(.red).multilineTextAlignment(.center) }
            }
            .padding(24)
        }
        .sheet(isPresented: $scanning) {
            ScannerView { code in
                scanning = false
                if !store.link(code) { error = "هذا ليس رمز ربط من «إدارة المشروع». اضغط «ربط جوال» في الكمبيوتر وصوّر الرمز الظاهر." }
            }
            .ignoresSafeArea()
        }
    }
}

// MARK: - الواجهة من الكمبيوتر

struct WebScreen: View {
    let url: URL
    let store: LinkStore
    @State private var failed: String?
    @State private var scanning = false

    var body: some View {
        ZStack {
            WebView(url: url, store: store, failed: $failed).ignoresSafeArea()
            if let f = failed {
                Color(UIColor.systemBackground).ignoresSafeArea()
                VStack(spacing: 14) {
                    Image(systemName: "wifi.exclamationmark").font(.system(size: 54)).foregroundColor(.orange)
                    Text("لا يصل التطبيق إلى الكمبيوتر").font(.title3.bold())
                    Text("تأكد أن الكمبيوتر شغّال ونافذة «تشغيل_الخادم» مفتوحة، وأن الجوال على نفس الواي فاي. إن سألك الآيفون عن «الشبكة المحلية» اختر «السماح».")
                        .multilineTextAlignment(.center).foregroundColor(.secondary)
                    Text(f).font(.footnote).foregroundColor(.secondary).multilineTextAlignment(.center)
                    Button("إعادة المحاولة") { store.reload() }.buttonStyle(.borderedProminent).tint(brand)
                    Button("ربط من جديد بالكاميرا") { scanning = true }.buttonStyle(.bordered)
                }
                .padding(28)
            }
        }
        .sheet(isPresented: $scanning) {
            ScannerView { code in
                scanning = false
                store.link(code)
            }
            .ignoresSafeArea()
        }
    }
}

struct WebView: UIViewRepresentable {
    let url: URL
    let store: LinkStore
    @Binding var failed: String?

    func makeCoordinator() -> Coordinator { Coordinator(self) }

    func makeUIView(context: Context) -> WKWebView {
        let cfg = WKWebViewConfiguration()
        cfg.websiteDataStore = .default()          // جلسة الربط تبقى محفوظة بين مرات الفتح
        cfg.allowsInlineMediaPlayback = true
        let wv = WKWebView(frame: .zero, configuration: cfg)
        wv.navigationDelegate = context.coordinator
        wv.uiDelegate = context.coordinator
        wv.scrollView.contentInsetAdjustmentBehavior = .never
        wv.isOpaque = false
        wv.backgroundColor = UIColor.systemBackground
        wv.load(URLRequest(url: url))
        return wv
    }

    func updateUIView(_ wv: WKWebView, context: Context) { context.coordinator.parent = self }

    final class Coordinator: NSObject, WKNavigationDelegate, WKUIDelegate {
        var parent: WebView
        init(_ p: WebView) { parent = p }

        private func isFile(_ u: URL) -> Bool {
            let p = u.path
            return p.hasPrefix("/api/documents/") || p == "/api/report.xlsx" || p == "/api/backup.db" || (p.hasPrefix("/api/requests/") && p.hasSuffix("/quote"))
        }

        func webView(_ wv: WKWebView, decidePolicyFor action: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
            guard let u = action.request.url, let scheme = u.scheme?.lowercased() else { decisionHandler(.allow); return }
            if scheme == "http" || scheme == "https" {
                if isFile(u) { decisionHandler(.cancel); Files.open(u, from: wv); return }
                if let host = u.host, LinkStore.isLocalHost(host) {
                    if action.targetFrame?.isMainFrame ?? true, let f = u.fragment, f.hasPrefix("pair=") { parent.store.adopt(u) }
                    decisionHandler(.allow); return
                }
                if action.navigationType == .linkActivated || action.targetFrame == nil {
                    UIApplication.shared.open(u); decisionHandler(.cancel); return
                }
            }
            decisionHandler(.allow)
        }

        func webView(_ wv: WKWebView, createWebViewWith configuration: WKWebViewConfiguration, for action: WKNavigationAction, windowFeatures: WKWindowFeatures) -> WKWebView? {
            if let u = action.request.url {
                if isFile(u) { Files.open(u, from: wv) }
                else if let h = u.host, LinkStore.isLocalHost(h) { wv.load(action.request) }
                else { UIApplication.shared.open(u) }
            }
            return nil
        }

        func webView(_ wv: WKWebView, didFinish navigation: WKNavigation!) { parent.failed = nil }
        func webView(_ wv: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) { fail(error) }
        func webView(_ wv: WKWebView, didFail navigation: WKNavigation!, withError error: Error) { fail(error) }
        func webViewWebContentProcessDidTerminate(_ wv: WKWebView) { wv.reload() }

        private func fail(_ e: Error) {
            let ns = e as NSError
            if ns.domain == NSURLErrorDomain && ns.code == NSURLErrorCancelled { return }
            if ns.domain == "WebKitErrorDomain" && ns.code == 102 { return }   // تنقل أُلغي عمداً (فتح ملف)
            parent.failed = e.localizedDescription
        }
    }
}

// MARK: - فتح ملفات الكمبيوتر (فاتورة، مطالبة، PDF، تقرير) في معاينة الآيفون

final class Preview: NSObject, QLPreviewControllerDataSource {
    let file: URL
    init(_ f: URL) { file = f }
    func numberOfPreviewItems(in controller: QLPreviewController) -> Int { 1 }
    func previewController(_ controller: QLPreviewController, previewItemAt index: Int) -> QLPreviewItem { file as NSURL }
}

enum Files {
    private static var current: Preview?

    static func open(_ url: URL, from wv: WKWebView) {
        wv.configuration.websiteDataStore.httpCookieStore.getAllCookies { cookies in
            var req = URLRequest(url: url)
            let mine = cookies.filter { $0.domain == url.host }
            for (k, v) in HTTPCookie.requestHeaderFields(with: mine) { req.setValue(v, forHTTPHeaderField: k) }
            URLSession.shared.dataTask(with: req) { data, resp, _ in
                DispatchQueue.main.async {
                    guard let data = data, let http = resp as? HTTPURLResponse, http.statusCode == 200 else {
                        show(wv, "تعذّر فتح الملف. تأكد أن الكمبيوتر شغّال."); return
                    }
                    var name = http.suggestedFilename ?? url.lastPathComponent
                    if (name as NSString).pathExtension.isEmpty { name += ext(http.mimeType) }
                    let dir = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString)
                    let file = dir.appendingPathComponent(name)
                    do {
                        try FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
                        try data.write(to: file)
                    } catch { show(wv, "تعذّر حفظ الملف"); return }
                    let p = Preview(file); current = p
                    let q = QLPreviewController(); q.dataSource = p
                    top(wv)?.present(q, animated: true)
                }
            }.resume()
        }
    }

    private static func ext(_ mime: String?) -> String {
        switch mime ?? "" {
        case "application/pdf": return ".pdf"
        case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": return ".xlsx"
        case "application/vnd.openxmlformats-officedocument.wordprocessingml.document": return ".docx"
        case "image/png": return ".png"
        case "image/jpeg": return ".jpg"
        default: return ""
        }
    }

    private static func top(_ v: UIView) -> UIViewController? {
        var vc = v.window?.rootViewController
        while let p = vc?.presentedViewController { vc = p }
        return vc
    }

    private static func show(_ v: UIView, _ msg: String) {
        let a = UIAlertController(title: nil, message: msg, preferredStyle: .alert)
        a.addAction(UIAlertAction(title: "حسناً", style: .default))
        top(v)?.present(a, animated: true)
    }
}

// MARK: - الكاميرا: قراءة رمز QR

struct ScannerView: UIViewControllerRepresentable {
    var onCode: (String) -> Void
    func makeUIViewController(context: Context) -> ScannerController {
        let vc = ScannerController()
        vc.onCode = onCode
        return vc
    }
    func updateUIViewController(_ vc: ScannerController, context: Context) {}
}

final class ScannerController: UIViewController, AVCaptureMetadataOutputObjectsDelegate {
    var onCode: ((String) -> Void)?
    private let session = AVCaptureSession()
    private var preview: AVCaptureVideoPreviewLayer?
    private var done = false
    private let label = UILabel()

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .black
        label.text = "وجّه الكاميرا على رمز QR في شاشة الكمبيوتر"
        label.textColor = .white
        label.font = .preferredFont(forTextStyle: .headline)
        label.numberOfLines = 0
        label.textAlignment = .center
        label.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(label)
        NSLayoutConstraint.activate([
            label.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 24),
            label.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -24),
            label.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor, constant: -40),
        ])
        AVCaptureDevice.requestAccess(for: .video) { ok in
            DispatchQueue.main.async { ok ? self.start() : self.denied() }
        }
    }

    private func start() {
        guard let dev = AVCaptureDevice.default(for: .video), let input = try? AVCaptureDeviceInput(device: dev), session.canAddInput(input) else { denied(); return }
        session.addInput(input)
        let out = AVCaptureMetadataOutput()
        guard session.canAddOutput(out) else { denied(); return }
        session.addOutput(out)
        out.setMetadataObjectsDelegate(self, queue: .main)
        out.metadataObjectTypes = [.qr]
        let layer = AVCaptureVideoPreviewLayer(session: session)
        layer.videoGravity = .resizeAspectFill
        layer.frame = view.bounds
        view.layer.insertSublayer(layer, at: 0)
        preview = layer
        let s = session
        DispatchQueue.global(qos: .userInitiated).async { s.startRunning() }
    }

    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        preview?.frame = view.bounds
    }

    private func denied() {
        label.text = "اسمح للتطبيق باستخدام الكاميرا من: الإعدادات ← إدارة المشروع ← الكاميرا"
    }

    func metadataOutput(_ output: AVCaptureMetadataOutput, didOutput metadataObjects: [AVMetadataObject], from connection: AVCaptureConnection) {
        guard !done, let o = metadataObjects.first as? AVMetadataMachineReadableCodeObject, let s = o.stringValue else { return }
        done = true
        session.stopRunning()
        UINotificationFeedbackGenerator().notificationOccurred(.success)
        onCode?(s)
    }

    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
        if session.isRunning { session.stopRunning() }
    }
}
