# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# --- React Native / Hermes safety net -----------------------------------
# Most RN libraries ship their own consumer-rules.pro inside their AAR, so
# this is usually not needed, but these extra keep rules reduce the risk of
# release-only crashes (works fine in debug, breaks after minify) caused by
# reflection-based native modules.
-keep,allowobfuscation @interface com.facebook.proguard.annotations.DoNotStrip
-keep,allowobfuscation @interface com.facebook.proguard.annotations.KeepGettersAndSetters
-keep,allowobfuscation @interface com.facebook.common.internal.DoNotStrip
-keep @com.facebook.proguard.annotations.DoNotStrip class *
-keep @com.facebook.common.internal.DoNotStrip class *
-keepclassmembers class * {
    @com.facebook.proguard.annotations.DoNotStrip *;
    @com.facebook.common.internal.DoNotStrip *;
}
-keepclassmembers @com.facebook.proguard.annotations.KeepGettersAndSetters class * {
  void set*(***);
  *** get*();
}
-keep class * extends com.facebook.react.bridge.NativeModule { *; }
-keepclassmembers,includedescriptorclasses class * { native <methods>; }
-keepclassmembers class *  { @com.facebook.react.uimanager.annotations.ReactProp <methods>; }
-keepclassmembers class *  { @com.facebook.react.uimanager.annotations.ReactPropGroup <methods>; }

# react-native-fs / react-native-print / react-native-share commonly rely on
# reflection to resolve host activities/providers — keep their packages intact.
-keep class com.rnfs.** { *; }
-keep class com.christopherdro.** { *; }
-keep class cl.json.** { *; }

# Keep annotation attributes and generic signatures for libraries that read
# them at runtime (React Navigation, AsyncStorage, DateTimePicker, Picker).
-keepattributes *Annotation*, Signature, Exceptions, InnerClasses, EnclosingMethod

