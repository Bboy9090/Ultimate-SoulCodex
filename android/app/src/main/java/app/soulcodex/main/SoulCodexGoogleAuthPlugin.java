package app.soulcodex.main;

import android.app.Activity;
import android.os.CancellationSignal;

import androidx.annotation.NonNull;
import androidx.core.content.ContextCompat;
import androidx.credentials.Credential;
import androidx.credentials.CredentialManager;
import androidx.credentials.CredentialManagerCallback;
import androidx.credentials.CustomCredential;
import androidx.credentials.GetCredentialRequest;
import androidx.credentials.GetCredentialResponse;
import androidx.credentials.exceptions.GetCredentialException;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.android.libraries.identity.googleid.GetSignInWithGoogleOption;
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential;

@CapacitorPlugin(name = "SoulCodexGoogleAuth")
public class SoulCodexGoogleAuthPlugin extends Plugin {
    @PluginMethod
    public void signIn(PluginCall call) {
        String serverClientId = call.getString("serverClientId");
        if (serverClientId == null || serverClientId.trim().isEmpty()) {
            call.reject("Google OAuth web client ID is required", "google_client_id_required");
            return;
        }

        Activity activity = getActivity();
        if (activity == null) {
            call.reject("Google Sign-In activity is unavailable", "google_activity_unavailable");
            return;
        }

        GetSignInWithGoogleOption googleOption =
            new GetSignInWithGoogleOption.Builder(serverClientId.trim()).build();

        GetCredentialRequest request =
            new GetCredentialRequest.Builder()
                .addCredentialOption(googleOption)
                .build();

        CredentialManager credentialManager = CredentialManager.create(activity);

        credentialManager.getCredentialAsync(
            activity,
            request,
            new CancellationSignal(),
            ContextCompat.getMainExecutor(activity),
            new CredentialManagerCallback<GetCredentialResponse, GetCredentialException>() {
                @Override
                public void onResult(GetCredentialResponse response) {
                    Credential credential = response.getCredential();
                    if (
                        credential instanceof CustomCredential &&
                        GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL.equals(credential.getType())
                    ) {
                        try {
                            GoogleIdTokenCredential googleCredential =
                                GoogleIdTokenCredential.createFrom(((CustomCredential) credential).getData());

                            JSObject result = new JSObject();
                            result.put("idToken", googleCredential.getIdToken());
                            result.put("email", googleCredential.getId());
                            result.put("displayName", googleCredential.getDisplayName());
                            call.resolve(result);
                            return;
                        } catch (Exception error) {
                            call.reject(
                                "Google credential could not be parsed",
                                "google_credential_parse_failed",
                                error
                            );
                            return;
                        }
                    }

                    call.reject(
                        "Unexpected credential type returned by Google",
                        "google_credential_type_invalid"
                    );
                }

                @Override
                public void onError(@NonNull GetCredentialException error) {
                    String type = error.getClass().getSimpleName();
                    String code =
                        type.contains("Cancellation")
                            ? "google_signin_cancelled"
                            : "google_signin_failed";
                    call.reject(
                        type.contains("Cancellation")
                            ? "Google Sign-In was cancelled"
                            : "Google Sign-In could not be completed",
                        code,
                        error
                    );
                }
            }
        );
    }
}
