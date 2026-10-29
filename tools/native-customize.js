// Passt das Capacitor-Android-Projekt an (idempotent): Hochformat, dunkles Theme/Splash, Icons.
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..'), res = path.join(root, 'android/app/src/main/res');
// ---------- iOS (nur Projektdateien, Build braucht einen Mac) ----------
const ios = path.join(root, 'ios/App/App');
if (fs.existsSync(ios)) {
  const pl = path.join(ios, 'Info.plist');
  let p = fs.readFileSync(pl, 'utf8');
  p = p.replace(/(<key>UISupportedInterfaceOrientations<\/key>\s*<array>)[\s\S]*?(<\/array>)/, '$1\n\t\t<string>UIInterfaceOrientationPortrait</string>\n\t$2');
  if (!p.includes('UIStatusBarStyle')) p = p.replace('<key>UIViewControllerBasedStatusBarAppearance</key>', '<key>UIStatusBarStyle</key>\n\t<string>UIStatusBarStyleLightContent</string>\n\t<key>UIViewControllerBasedStatusBarAppearance</key>');
  fs.writeFileSync(pl, p);
  const icon = path.join(ios, 'Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png');
  if (fs.existsSync(icon)) fs.copyFileSync(path.join(root, 'icons/ios-icon-1024.png'), icon);
  const spl = path.join(ios, 'Assets.xcassets/Splash.imageset');
  if (fs.existsSync(spl)) for (const f of fs.readdirSync(spl)) if (f.endsWith('.png')) fs.copyFileSync(path.join(root, 'icons/splash.png'), path.join(spl, f));
  console.log('iOS-Projekt angepasst.');
}
if (!fs.existsSync(res)) { console.log('android/ fehlt – zuerst "npx cap add android"'); process.exit(0); }
const BG = '#0a0816', ICON_BG = '#150f2c';

const man = path.join(root, 'android/app/src/main/AndroidManifest.xml');
let m = fs.readFileSync(man, 'utf8');
if (!m.includes('screenOrientation')) m = m.replace('android:name=".MainActivity"', 'android:name=".MainActivity"\n            android:screenOrientation="portrait"');
fs.writeFileSync(man, m);

fs.writeFileSync(path.join(res, 'values/colors.xml'), `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="colorPrimary">${BG}</color>
    <color name="colorPrimaryDark">${BG}</color>
    <color name="colorAccent">#6fe0d6</color>
    <color name="splashBackground">${BG}</color>
</resources>
`);
fs.writeFileSync(path.join(res, 'values/ic_launcher_background.xml'), `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">${ICON_BG}</color>
</resources>
`);
fs.writeFileSync(path.join(res, 'values/styles.xml'), `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="AppTheme" parent="Theme.AppCompat.NoActionBar">
        <item name="colorPrimary">@color/colorPrimary</item>
        <item name="colorPrimaryDark">@color/colorPrimaryDark</item>
        <item name="colorAccent">@color/colorAccent</item>
        <item name="android:statusBarColor">@color/colorPrimaryDark</item>
        <item name="android:navigationBarColor">@color/colorPrimaryDark</item>
        <item name="android:windowBackground">@color/splashBackground</item>
    </style>

    <style name="AppTheme.NoActionBar" parent="Theme.AppCompat.NoActionBar">
        <item name="windowActionBar">false</item>
        <item name="windowNoTitle">true</item>
        <item name="android:background">@null</item>
        <item name="android:statusBarColor">@color/colorPrimaryDark</item>
        <item name="android:navigationBarColor">@color/colorPrimaryDark</item>
        <item name="android:windowBackground">@color/splashBackground</item>
    </style>

    <style name="AppTheme.NoActionBarLaunch" parent="Theme.SplashScreen">
        <item name="android:background">@drawable/splash</item>
        <item name="windowSplashScreenBackground">@color/splashBackground</item>
        <item name="windowSplashScreenAnimatedIcon">@mipmap/ic_launcher_foreground</item>
        <item name="postSplashScreenTheme">@style/AppTheme.NoActionBar</item>
    </style>
</resources>
`);
// Icons
const icons = path.join(root, 'icons/android');
for (const d of fs.readdirSync(icons)) for (const f of fs.readdirSync(path.join(icons, d)))
  fs.copyFileSync(path.join(icons, d, f), path.join(res, d, f));
// Splash (alle Dichten, hoch & quer)
// Nur eine Splash-Grafik (drawable/), Dichte-Varianten entfernen -> kleinere APK
for (const d of fs.readdirSync(res)) if (d.startsWith('drawable-') && fs.existsSync(path.join(res, d, 'splash.png'))) {
  fs.rmSync(path.join(res, d, 'splash.png'));
  if (!fs.readdirSync(path.join(res, d)).length) fs.rmdirSync(path.join(res, d));
}
fs.copyFileSync(path.join(root, 'icons/splash.png'), path.join(res, 'drawable/splash.png'));
console.log('Android-Projekt angepasst.');
