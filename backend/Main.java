import static spark.Spark.*;
import com.google.gson.*;
import java.util.Map;
import java.util.HashMap;
import java.util.concurrent.ConcurrentHashMap;

public class Main {
  // Storage for WebRTC signaling
  private static final Map<String, String> offers = new ConcurrentHashMap<>();
  private static final Map<String, String> answers = new ConcurrentHashMap<>();
  private static final Map<String, JsonArray> iceCandidates = new ConcurrentHashMap<>();

  public static void main(String[] args) {
    port(8080);
    
    // Enable CORS
    options("/*", (req, res) -> {
      String accessControlRequestHeaders = req.headers("Access-Control-Request-Headers");
      if (accessControlRequestHeaders != null) {
        res.header("Access-Control-Allow-Headers", accessControlRequestHeaders);
      }

      String accessControlRequestMethod = req.headers("Access-Control-Request-Method");
      if (accessControlRequestMethod != null) {
        res.header("Access-Control-Allow-Methods", accessControlRequestMethod);
      }

      return "OK";
    });

    before((req, res) -> {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
      res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept");
      res.type("application/json");
    });

    post("/api/symptom-check", (req, res) -> {
      try {
        JsonObject body = JsonParser.parseString(req.body()).getAsJsonObject();
        
        if (!body.has("symptoms")) {
          res.status(400);
          return new Gson().toJson(Map.of("error", "Symptoms parameter is required"));
        }
        
        String symptoms = body.get("symptoms").getAsString();
        String diagnosis = SymptomChecker.getDiagnosis(symptoms);
        res.type("application/json");
        return new Gson().toJson(Map.of("diagnosis", diagnosis));
      } catch (Exception e) {
        res.status(500);
        return new Gson().toJson(Map.of("error", "Error processing symptom check: " + e.getMessage()));
      }
    });

    get("/api/first-aid/:condition", (req, res) -> {
      String condition = req.params("condition");
      if (condition == null || condition.isEmpty()) {
        res.status(400);
        return new Gson().toJson(Map.of("error", "Condition parameter is required"));
      }

      String advice = FirstAidHandler.getAdvice(condition);
      return new Gson().toJson(Map.of("instructions", advice));
    });

    get("/first-aid", (req, res) -> {
      String condition = req.queryParams("condition");
      if (condition == null || condition.isEmpty()) {
        res.status(400);
        return new Gson().toJson(Map.of("error", "Condition parameter is required"));
      }

      String advice = FirstAidHandler.getAdvice(condition);
      return new Gson().toJson(Map.of("instructions", advice));
    });

    
    post("/webrtc/offer", (req, res) -> {
      JsonObject body = JsonParser.parseString(req.body()).getAsJsonObject();
      String roomId = body.get("roomId").getAsString();
      String offer = body.get("offer").getAsString();
      
      offers.put(roomId, offer);
      iceCandidates.put(roomId, new JsonArray());
      
      return new Gson().toJson(Map.of("success", true));
    });
    
    get("/webrtc/offer/:roomId", (req, res) -> {
      String roomId = req.params("roomId");
      String offer = offers.get(roomId);
      
      if (offer == null) {
        res.status(404);
        return new Gson().toJson(Map.of("error", "No offer found for room: " + roomId));
      }
      
      return new Gson().toJson(Map.of("offer", offer));
    });
    
    post("/webrtc/answer", (req, res) -> {
      JsonObject body = JsonParser.parseString(req.body()).getAsJsonObject();
      String roomId = body.get("roomId").getAsString();
      String answer = body.get("answer").getAsString();
      
      answers.put(roomId, answer);
      
      return new Gson().toJson(Map.of("success", true));
    });
    
    get("/webrtc/answer/:roomId", (req, res) -> {
      String roomId = req.params("roomId");
      String answer = answers.get(roomId);
      
      if (answer == null) {
        res.status(404);
        return new Gson().toJson(Map.of("error", "No answer found for room: " + roomId));
      }
      
      return new Gson().toJson(Map.of("answer", answer));
    });
    
    post("/webrtc/ice-candidate", (req, res) -> {
      JsonObject body = JsonParser.parseString(req.body()).getAsJsonObject();
      String roomId = body.get("roomId").getAsString();
      JsonObject candidate = body.get("candidate").getAsJsonObject();
      
      JsonArray candidates = iceCandidates.get(roomId);
      if (candidates == null) {
        candidates = new JsonArray();
        iceCandidates.put(roomId, candidates);
      }
      
      candidates.add(candidate);
      
      return new Gson().toJson(Map.of("success", true));
    });
    
    get("/webrtc/ice-candidates/:roomId", (req, res) -> {
      String roomId = req.params("roomId");
      JsonArray candidates = iceCandidates.get(roomId);
      
      if (candidates == null) {
        candidates = new JsonArray();
      }
      
      return new Gson().toJson(Map.of("candidates", candidates));
    });
    get("/api/doctors/:doctorId/availability", (req, res) -> {
      String doctorId = req.params("doctorId");
      JsonObject availability = new JsonObject();
      availability.addProperty("available", true);
      availability.addProperty("nextAvailable", new java.util.Date().toString());
      
      JsonArray timeSlots = new JsonArray();
      JsonObject slot1 = new JsonObject();
      slot1.addProperty("start", "09:00");
      slot1.addProperty("end", "09:30");
      timeSlots.add(slot1);
      
      JsonObject slot2 = new JsonObject();
      slot2.addProperty("start", "10:00");
      slot2.addProperty("end", "10:30");
      timeSlots.add(slot2);
      
      JsonObject slot3 = new JsonObject();
      slot3.addProperty("start", "11:00");
      slot3.addProperty("end", "11:30");
      timeSlots.add(slot3);
      
      availability.add("timeSlots", timeSlots);
      
      return availability.toString();
    });
    
    post("/api/appointments", (req, res) -> {
      JsonObject body = JsonParser.parseString(req.body()).getAsJsonObject();
      JsonObject response = new JsonObject();
      response.addProperty("success", true);
      response.addProperty("appointmentId", "appt-" + System.currentTimeMillis());
      return response.toString();
    });
    
    get("/api/users/:userId/medical-history", (req, res) -> {
      String userId = req.params("userId");
      JsonObject history = new JsonObject();
      
      JsonArray allergies = new JsonArray();
      allergies.add("Pollen");
      allergies.add("Penicillin");
      history.add("allergies", allergies);
      
      JsonArray conditions = new JsonArray();
      conditions.add("Asthma");
      history.add("conditions", conditions);
      
      JsonArray medications = new JsonArray();
      medications.add("Albuterol");
      history.add("medications", medications);
      
      JsonArray surgeries = new JsonArray();
      history.add("pastSurgeries", surgeries);
      
      return history.toString();
    });

    get("/health", (req, res) -> {
      return new Gson().toJson(Map.of("status", "UP", "message", "Doctor-Sab API is running"));
    });
  }
}
