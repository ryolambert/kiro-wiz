---
title: "Custom extension registry - IDE - Docs - Kiro"
sourceUrl: "https://kiro.dev/docs/editor/extension-registry/"
category: "editor"
lastUpdated: "2026-02-07T05:52:00.237Z"
---
# Custom extension registry

---

By default, Kiro uses the extension marketplace at [https://open-vsx.org](https://open-vsx.org). You can configure Kiro to use a different extenson registry, for example, a private registry for your organization that contains a limited set of vetted extensions.

## Configuring a different extension marketplace

Locate the `product.json` file on disk. The exact location depends on the platform:

- macOS: /Applications/Kiro.app/Contents/Resources/app/product.json
- Windows: C:\Program Files\Kiro\resources\app\product.json
- Linux: /usr/lib/code/product.json

Open the `product.json` file in an editor, and locate the `extensionsGallery` property. Within that property, update `serviceUrl`, `itemUrl`, and `resourceUrlTemplate` to point to your private registry, instead of `https://open-vsx.org`.

For example, if your custom registry is hosted at [https://registry.example.com](https://registry.example.com), update the `extensionsGallery` property to look like this:

```json
"extensionsGallery": {
    "serviceUrl": "https://registry.example.com/vscode/gallery",
    "itemUrl": "https://registry.example.com/vscode/item",
    "resourceUrlTemplate": "https://registry.example.com/vscode/unpkg/{publisher}/{name}/{version}/{path}",
    "controlUrl": "",
    "recommendationsUrl": "",
    "nlsBaseUrl": "",
    "publisherUrl": ""
}

```

To configure all Kiro installs in your organization to use a custom extension registry, use an endpoint management, Mobile Device Management (MDM) solution, or similar to make the above update to `product.json` across all your devices.