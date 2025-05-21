import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.ArrayList;
import java.util.Arrays;
import java.io.Reader;
import java.io.FileReader;
import java.io.IOException;
import java.nio.file.Paths;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import java.lang.reflect.Type;

public class SymptomChecker {
  
  // Maps to store symptom data
  private static final Map<String, List<String>> symptomConditions = new HashMap<>();
  private static final List<String> emergencySymptoms = new ArrayList<>();
  private static final Map<String, List<String>> adviceMap = new HashMap<>();
  private static String generalAdvice = "";
  
  static {
    try {
      String filePath = "backend/symptoms_data.json";
      if (!java.nio.file.Files.exists(java.nio.file.Paths.get(filePath))) {
        filePath = "symptoms_data.json";
      }
      
      Reader reader = new FileReader(filePath);
      Gson gson = new Gson();
      
      Type symptomDataType = new TypeToken<Map<String, Object>>(){}.getType();
      Map<String, Object> symptomData = gson.fromJson(reader, symptomDataType);
      
      if (symptomData.containsKey("symptomConditions")) {
        Map<String, List<String>> conditions = 
            (Map<String, List<String>>) symptomData.get("symptomConditions");
        symptomConditions.putAll(conditions);
      }
      
      if (symptomData.containsKey("emergencySymptoms")) {
        emergencySymptoms.addAll((List<String>) symptomData.get("emergencySymptoms"));
      }
      
      if (symptomData.containsKey("adviceMap")) {
        adviceMap.putAll((Map<String, List<String>>) symptomData.get("adviceMap"));
      }
      
      if (symptomData.containsKey("generalAdvice")) {
        generalAdvice = (String) symptomData.get("generalAdvice");
      }
      
      reader.close();
      System.out.println("Successfully loaded symptom data with " + 
                        symptomConditions.size() + " symptoms and " + 
                        emergencySymptoms.size() + " emergency conditions.");
    } catch (IOException e) {
      System.err.println("Error loading symptom data: " + e.getMessage());
      symptomConditions.put("fever", Arrays.asList("Common Cold", "Flu"));
      emergencySymptoms.add("severe chest pain");
      generalAdvice = "Seek medical attention if symptoms worsen or persist.";
    }
  }

  public static String getDiagnosis(String symptomsInput) {
    String symptoms = symptomsInput.toLowerCase();
    
    List<String> possibleConditions = new ArrayList<>();
    
    for (String emergencySymptom : emergencySymptoms) {
      if (symptoms.contains(emergencySymptom)) {
        return "EMERGENCY: These symptoms require immediate medical attention. Please call emergency services (911) immediately.";
      }
    }
    
    for (Map.Entry<String, List<String>> entry : symptomConditions.entrySet()) {
      if (symptoms.contains(entry.getKey())) {
        possibleConditions.addAll(entry.getValue());
      }
    }
    
    List<String> uniqueConditions = new ArrayList<>();
    for (String condition : possibleConditions) {
      if (!uniqueConditions.contains(condition)) {
        uniqueConditions.add(condition);
      }
    }
    
    StringBuilder diagnosis = new StringBuilder();
    
    if (uniqueConditions.isEmpty()) {
      diagnosis.append("Based on the symptoms described, no specific condition could be identified. ");
      diagnosis.append("Please provide more details about your symptoms or consult a healthcare professional for a proper diagnosis.");
    } else {
      diagnosis.append("Based on the symptoms described, here are some possible conditions:\n\n");
      
      for (String condition : uniqueConditions) {
        diagnosis.append("- ").append(condition).append("\n");
      }
      
      diagnosis.append("\nPlease note: This is not a definitive diagnosis. ");
      diagnosis.append("These are just possibilities based on the symptoms you've described. ");
      diagnosis.append("For proper medical advice, please consult a healthcare professional.");
    }
    
    diagnosis.append("\n\nGeneral advice:\n");
    
    for (Map.Entry<String, List<String>> entry : adviceMap.entrySet()) {
      if (symptoms.contains(entry.getKey())) {
        for (String advice : entry.getValue()) {
          diagnosis.append("- ").append(advice).append("\n");
        }
      }
    }
    
    diagnosis.append("- ").append(generalAdvice);
    
    return diagnosis.toString();
  }
}
