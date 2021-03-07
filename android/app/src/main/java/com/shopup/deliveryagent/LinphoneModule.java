package com.shopup.deliveryagent;

import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.media.AudioManager;
import android.util.Log;

import androidx.core.app.ActivityCompat;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import org.linphone.core.Address;
import org.linphone.core.Call;
import org.linphone.core.CallParams;
import org.linphone.core.Core;
import org.linphone.core.CoreListenerStub;

import java.util.ArrayList;

import javax.annotation.Nonnull;

public class LinphoneModule extends ReactContextBaseJavaModule {

    public static final String REACT_CLASS = "Linphone";
    private static ReactApplicationContext reactContext;
    private CoreListenerStub mCoreListener;

    public LinphoneModule(@Nonnull ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Nonnull
    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @ReactMethod
    public void startService() {
        this.reactContext.startService(new Intent(this.reactContext, LinphoneService.class));
    }

    @ReactMethod
    public void stopService() {
        this.reactContext.stopService(new Intent(this.reactContext, LinphoneService.class));
    }

    @ReactMethod
    public void makeCall(String phoneNumber) {
        checkAndRequestCallPermissions();
        Log.d("[Phone]",phoneNumber);
        Core core = LinphoneService.getCore();
        Address addressToCall = core.interpretUrl(phoneNumber);
        CallParams params = core.createCallParams(null);
        if (addressToCall != null) {
            core.inviteAddressWithParams(addressToCall, params);
        }
    }

    @ReactMethod
    public void holdCall(Callback setStatus){
        Core core = LinphoneService.getCore();
        Call call = core.getCurrentCall();
        if(call != null){
            if(call.getState() != Call.State.Paused) {
                call.pause();
                setStatus.invoke(true);
            }
            else {
                call.resume();
                setStatus.invoke(false);
            }
        }
    }

    @ReactMethod
    public void muteMic(Callback setStatus){
        Core core = LinphoneService.getCore();
        core.enableMic(!core.micEnabled());
        setStatus.invoke(core.micEnabled());
    }

    @ReactMethod
    public void terminateCall(Callback goBack){
        Core core = LinphoneService.getCore();
        Call call = core.getCurrentCall();
        if (call != null) {
            call.terminate();
        }
        goBack.invoke();
    }

    @ReactMethod
    public void switchSpeaker(Callback setStatus){
        AudioManager mAudioManager;
        mAudioManager = ((AudioManager) reactContext.getSystemService(reactContext.AUDIO_SERVICE));
        mAudioManager.setSpeakerphoneOn(!mAudioManager.isSpeakerphoneOn());
        setStatus.invoke(mAudioManager.isSpeakerphoneOn());
    }

    private void checkAndRequestCallPermissions() {
        ArrayList<String> permissionsList = new ArrayList<>();

        int recordAudio =
                reactContext.getPackageManager()
                        .checkPermission(Manifest.permission.RECORD_AUDIO, reactContext.getPackageName());
        org.linphone.core.tools.Log.i(
                "[Permission] Record audio permission is "
                        + (recordAudio == PackageManager.PERMISSION_GRANTED
                        ? "granted"
                        : "denied"));
        int camera =
                reactContext.getPackageManager().checkPermission(Manifest.permission.CAMERA, reactContext.getPackageName());
        org.linphone.core.tools.Log.i(
                "[Permission] Camera permission is "
                        + (camera == PackageManager.PERMISSION_GRANTED ? "granted" : "denied"));

        if (recordAudio != PackageManager.PERMISSION_GRANTED) {
            org.linphone.core.tools.Log.i("[Permission] Asking for record audio");
            permissionsList.add(Manifest.permission.RECORD_AUDIO);
        }

        if (camera != PackageManager.PERMISSION_GRANTED) {
            org.linphone.core.tools.Log.i("[Permission] Asking for camera");
            permissionsList.add(Manifest.permission.CAMERA);
        }

        if (permissionsList.size() > 0) {
            String[] permissions = new String[permissionsList.size()];
            permissions = permissionsList.toArray(permissions);
            ActivityCompat.requestPermissions(reactContext.getCurrentActivity(), permissions, 0);
        }
    }
}
