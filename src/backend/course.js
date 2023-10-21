class Course {

     grade = 0;
     assignments = [];

     addAssignment(json) {
      let newAssignment = new Assignment();
      newAssignment.loadFromJson(json);
      this.assignments.push(newAssignment);
     }

     countSimilarAssignments(assignment) {
      assignmentName = assignment.name;
      number = 0;
      
      for (i=0; i<this.assignments.length; i++)
      {
         if (assignments[i].includes(assignmentName) || assignmentName.includes(assignments[i])) {
            number++;
         }
      }
      assignment.similar_assignments = number;
      return number;
     }
}