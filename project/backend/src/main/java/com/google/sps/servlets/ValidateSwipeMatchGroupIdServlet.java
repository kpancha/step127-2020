package com.google.sps.servlets;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.FirestoreOptions;
import java.io.IOException;
import java.util.Optional;
import java.util.concurrent.ExecutionException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/api/swipe-match/validate-group-id")
public class ValidateSwipeMatchGroupIdServlet extends HttpServlet {
  private static final String PROJECT_ID = "mak-step-2020";
  private static final String COLLECTION_NAME = "swipe-match-sessions";

  private Optional<FirestoreOptions> firestoreOptions;
  private Optional<Firestore> db;

  @Override
  public void init() {
    try {
      firestoreOptions = Optional.of(FirestoreOptions.getDefaultInstance()
                                         .toBuilder()
                                         .setProjectId(PROJECT_ID)
                                         .setCredentials(GoogleCredentials.getApplicationDefault())
                                         .build());

      db = Optional.of(firestoreOptions.get().getService());
    } catch (IOException e) {
      firestoreOptions = Optional.empty();
      db = Optional.empty();
    }
  }

  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    boolean valid = false;
    try {
      valid = validateGroupId(request.getParameter("groupId"));
      response.getWriter().println("{\"valid\": \"" + valid + "\"}");
    } catch (InterruptedException | ExecutionException e) {
      response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
    }
  }

  private boolean validateGroupId(String groupId) throws InterruptedException, ExecutionException {
    return db.get().collection(COLLECTION_NAME).document(groupId).get().get().exists();
  }
}
