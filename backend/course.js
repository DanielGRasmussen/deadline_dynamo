class Course {

   id = 0;
   course_code = "";
   grade = 0;
   assignments = [];
   assignment_names = "";
   name = "";

     addAssignment(json) {
      let newAssignment = new Assignment();
      newAssignment.loadFromJson(json);
      newAssignment.course_name = this.name;
      assignment_names.push(newAssignment.name);
      this.assignments.push(newAssignment);
     }

     loadFromJson(json) {
      parsedJson = JSON.parse(json);
      this.name = parsedJson.name;
      this.course_code = parsedJson.course_code;
      this.id = parsedJson.id;
     }

     countOccurrences(string, subString, allowOverlapping) { //https://stackoverflow.com/questions/4009756/how-to-count-string-occurrence-in-string

      string += "";
      subString += "";
      if (subString.length <= 0) return (string.length + 1);
  
      var n = 0,
          pos = 0,
          step = allowOverlapping ? 1 : subString.length;
  
      while (true) {
          pos = string.indexOf(subString, pos);
          if (pos >= 0) {
              ++n;
              pos += step;
          } else break;
      }
      return n;
  }

     countSimilarAssignments(assignment) {
      assignmentName = assignment.name;
      number = 0;
      
      occurences = this.countOccurrences(this.assignment_names, assignmentName);
      return occurences - 1;
     }

     computeAllAssignmentScores() {
      for (i=0; i < this.assignments.length; i++) {
         assignments[i].similar_assignments = this.countSimilarAssignments(assignments[i])
         assignments[i].computeAllAssignmentScores;
      }
     }

     toJSON() {
      stringBuilder = '';
      stringBuilder += "\"" + this.course_code + "\":{";
      stringBuilder += "\"title\":" + this.name + "\"}";
     }

     allAssignmentsToJSON(removeTrailingComma=false) {
      firstAssignment = true; //this really should be "isFirstAssignment" for readibility but it's 4am and I already wrote it this way
      stringBuilder = "";
      for (i=0 ; i < this.assignments.length; i++) {
         
         if (firstAssignment == false) {
            stringBuilder += ",";
         } else {
            firstAssignment = false;
         }

         stringBuilder += this.assginments[i].toJSON();

      }

      if (removeTrailingComma == true) {
         return stringBuilder.slice(0, -1);
      } else {
         return stringBuilder;
      }

     }

}