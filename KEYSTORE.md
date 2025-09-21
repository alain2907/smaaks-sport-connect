# SMAAKS Groups - Keystore Information

## Android APK Signing Keystore

### Keystore Details
- **File**: `android.keystore`
- **Location**: `/Users/alainnataf/smaaks/smaaks-groups/android-app/android.keystore`
- **Alias**: `smaaks_groups`
- **Algorithm**: RSA 2048-bit
- **Validity**: 10,000 days (27+ years)
- **Format**: JKS (Java KeyStore)
- **Signature Algorithm**: SHA256withRSA

### Passwords
- **Keystore Password**: `Sm@@ks2025Match!`
- **Key Password**: `Sm@@ks2025Match!` (same as keystore)

### Certificate Information
```
Subject: CN=SMAAKS Groups, OU=SMAAKS, O=SMAAKS SAS, L=Paris, ST=IDF, C=FR
Issuer: Self-signed
Key Size: 2048-bit RSA
Signature Algorithm: SHA256withRSA
Valid for: 27+ years (until ~2052)
```

### Build & Sign Process

#### Prerequisites
```bash
# Set Java 17 environment (REQUIRED - Java 24 will fail)
export JAVA_HOME="/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home"
export PATH="$JAVA_HOME/bin:$PATH"

# Verify Java version
java -version  # Should show version 17.x
```

#### Build Commands (Auto-Signed)
```bash
# Navigate to android-app directory
cd android-app

# Clean previous builds
./gradlew clean

# Build debug APK (for testing)
./gradlew assembleDebug

# Build release APK (auto-signed for production)
./gradlew assembleRelease

# Build Android App Bundle (auto-signed for Google Play Store)
./gradlew bundleRelease

# Build both APK and AAB
./gradlew assembleRelease bundleRelease
```

#### Signing Configuration
Signing is now **automatic** via `gradle.properties`:
```
MYAPP_UPLOAD_STORE_FILE=android.keystore
MYAPP_UPLOAD_KEY_ALIAS=smaaks_groups
MYAPP_UPLOAD_STORE_PASSWORD=Sm@@ks2025Match!
MYAPP_UPLOAD_KEY_PASSWORD=Sm@@ks2025Match!
```

### APK Information
- **Package ID**: `com.smaaks.groups1`
- **App Name**: SMAAKS Groups
- **Version Name**: 1.5
- **Version Code**: 8
- **Min SDK**: 21 (Android 5.0+)
- **Target URL**: https://smaaks-groups.vercel.app
- **Type**: Trusted Web Activity (TWA)

### App Features
- 🎨 Purple theme (#5A2D82) matching web app
- 📱 Adaptive launcher icons
- 🚀 App shortcuts: Mes Groupes & Créer un Groupe
- 📲 Native Android integration
- 🌐 Offline support with custom page
- 🔔 Push notifications ready

### Digital Asset Links (App Links)
- **File Location**: `public/.well-known/assetlinks.json`
- **SHA256 Fingerprint**: `34:CA:4F:B9:35:36:D5:5A:B6:E5:4A:AF:42:89:69:24:B2:2A:E6:49:E8:D2:71:82:DE:29:2C:5E:FB:92:F0:31`
- **Package Name**: `com.smaaks.groups1`
- **Production URL**: https://smaaks-groups.vercel.app/.well-known/assetlinks.json
- **Purpose**: Enables deep linking and domain verification in Google Play

### Security Best Practices
- 🔐 **Strong Passwords**: 16+ characters with special chars (@), numbers, mixed case
- 🏦 **Safe Storage**: Store keystore in multiple secure locations
- 🚫 **Never Commit**: Keep keystore out of version control (.gitignore configured)
- 💾 **Backup Strategy**: Maintain encrypted backups
- 🔑 **Password Manager**: Store credentials securely
- 🔒 **Environment Variables**: Use for CI/CD automation

### Environment Variables (CI/CD)
```bash
# Recommended environment variables
export SMAAKS_KEYSTORE_PATH="/path/to/android.keystore"
export SMAAKS_KEYSTORE_PASSWORD="Sm@@ks2025Match!"
export SMAAKS_KEY_ALIAS="smaaks_groups"
```

### Troubleshooting

#### APK Installation Issues
- **"App not installed" error**: Use debug version for testing
- **Certificate issues**: This keystore has been tested and confirmed working
- **Java version**: MUST use Java 17, not Java 24+
- **Path issues**: Ensure android.keystore is in android-app/app/ directory

#### Common Fixes
```bash
# If APK won't install, try debug version first
./gradlew assembleDebug

# Check APK signature
jarsigner -verify app/build/outputs/apk/release/app-release.apk

# Install via ADB
adb install -r SMAAKS-Groups-v1.2-CLEAN.apk
```

### Distribution Files
- **APK** (sideloading): `SMAAKS-Groups-v1.5-FINAL-VersionCode8.apk`
- **AAB** (Google Play): `SMAAKS-Groups-v1.5-GooglePlay-VersionCode8.aab`
- **Debug APK** (testing): Available via `./gradlew assembleDebug`

### File Locations
```
smaaks-groups/
├── android-app/
│   ├── android.keystore                # Signing keystore (DO NOT COMMIT)
│   ├── app/android.keystore            # Copy for Gradle build
│   ├── twa-manifest.json              # TWA configuration
│   ├── app/build/outputs/
│   │   ├── apk/
│   │   │   ├── debug/app-debug.apk    # Debug build
│   │   │   └── release/app-release.apk # Release APK (signed)
│   │   └── bundle/release/app-release.aab # Release AAB (signed)
│   ├── SMAAKS-Groups-v1.5-FINAL-VersionCode8.apk  # Final production APK
│   └── SMAAKS-Groups-v1.5-GooglePlay-VersionCode8.aab # Google Play App Bundle
└── KEYSTORE.md                         # This documentation
```

### Distribution Guide
- **Google Play Store**: Use AAB from `./gradlew bundleRelease`
- **Direct Installation**: Use `SMAAKS-Groups-v1.5-FINAL-VersionCode8.apk`
- **Testing/Development**: Use debug APK from `./gradlew assembleDebug`

### Version History
- **v1.0** (Sept 16, 2025): Initial release for SMAAKS Groups PWA
- **v1.1** (Sept 16, 2025): Changed package ID to com.smaaks.groups1 to avoid conflicts
- **v1.2** (Sept 16, 2025): Complete cleanup - removed all smaaks-match references
- **v1.5** (Sept 21, 2025): Google Play Store release - versionCode 8, optimized build

---
**⚠️ CRITICAL: This keystore must be used for ALL future updates to maintain app continuity on Google Play Store.**
**✅ VERIFIED: This keystore configuration has been tested and confirmed working on Android devices.**