package com.prinex.webviewexample;

import static android.content.res.AssetManager.ACCESS_STREAMING;
import static android.webkit.ConsoleMessage.MessageLevel.LOG;

import android.app.Activity;
import android.content.Context;
import android.content.res.AssetManager;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

public class MainActivity extends Activity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        WebView webView = (WebView) findViewById(R.id.webview);

        WebView.setWebContentsDebuggingEnabled(true);
        WebSettings webSettings = webView.getSettings();
        webSettings.setAllowFileAccessFromFileURLs(true);
        webSettings.setAllowUniversalAccessFromFileURLs(true);
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webView.getSettings().setAppCacheEnabled(true);
        webView.loadUrl("https://flpnwc-tcayhtwfm2.dispatcher.eu2.hana.ondemand.com/sites/MoFip#Shell-home");

        webView.setWebViewClient(new WebViewClient() {

            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view,
                                                              WebResourceRequest request) {

                Uri uri = request.getUrl();
                String path = uri.getHost() + uri.getPath();

                if (uri.getPath().endsWith(".js") == true && ifAssetExists(path)) {
                    try {
                        Log.d("Test","Replaced " + path);
                        Map<String, String> headers = new HashMap<>();
                        headers.put("Access-Control-Allow-Origin", "*");
                        return new WebResourceResponse("application/javascript", "UTF-8",
                                200, "OK", headers,
                                getAssets().open(path, ACCESS_STREAMING));
                    } catch (IOException e) {
                        Log.e("Test","Replaced busted !" + path);
                        return super.shouldInterceptRequest(view, request);
                    }
                }

                return super.shouldInterceptRequest(view, request);
                // look in assets for the file: if found return it otherwise all good.

            }

            private boolean ifAssetExists(String abspath) {
                String[] dirs = abspath.split("\\/");
                String parent = "";
                for (int i = 0; i < dirs.length; i++) {

                    String dir = dirs[i];
                    try {
                        if (Arrays.asList(getResources().getAssets().list(parent)).contains(dir)) {
                            // if it is not the last one, continue looping
                            if (i < dirs.length - 1) {
                                if (parent == "") {
                                    parent = dir;
                                    continue;
                                }
                                parent = parent + "/" + dir;
                                continue;
                            }
                            // we are at the end

                            return true;
                        }
                    } catch (IOException e) {
                        // does not matter what then things as usual
                        return false;
                    }
                }
                return false;
            }

        });

    }
}