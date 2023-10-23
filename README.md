# Deadline Dynamo
Make Canvas scheduling smarter.
Theseus Crew's Submission for BYU-Idaho Fall 2023 Hackathon.

## Overview
Instructure Canvas has a dashboard which shows assignments to students primarily by due date. This can create bad time management and a false sense of security as some days seem completely open, while others are flooded with assignments.

Deadline Dynamo is a web extension that uses the Canvas API to fetch the user's course data and intelligently suggest a more even workload. Each assignment is prioritized by several factors, and a reasonably accurate estimate is given for how long each assignment will take to complete. These estimates are used to balance the student's workload across the week.

## How to Use
This repo is an unpacked Google Chrome extension. Clone or download the repo, open Google Chrome's extensions page, and turn on Developer Mode. Click the button labeled "Load unpacked," then navigate to the /src folder in the github download and select *the folder* (not a file inside of it). Chrome will load the extension.

Navigate to the Canvas homepage. Switch to List View (three dots in the corner) and reload the page, if applicable. You will see your normal dashboard get replaced with our time-organized one.

## Limitations
The plugin has ONLY been tested on student accounts. We did not have access to teacher accounts on which we could test the extension. Viewing the dashboard in student preview mode might display proper functionality, but we just don't know for sure. ***If the extension does not perform properly on a teacher account, please seek out a student account in order to properly assess the plugin's functionality.***

Due to time constraints, the extension currently only works on byui.instructure.com and NOT on any other Canvas/Instructure instances.

There is a known issue where, although the assignments are properly prioritized, individual days' worth of work are displayed out of order (e.g. the suggestede assignments for October 23 are shown before those for October 22). We did not have time to troubleshoot this issue before the submission deadline.

## Planning
* [Proposal](https://docs.google.com/document/d/1qw7jQ2S4l4O4TtOaj4MI7oOv84VMI8qrQ6aIFF-ewdg/edit?usp=sharing)
* [Project Specs](https://docs.google.com/document/d/1okTquBZYfPdrYRvzIBK9-npC2IoLpEgTCj1azZ47H9w/edit)
* [Data Flow Diagram](https://lucid.app/lucidchart/a97f9fc8-905c-4f1b-bcdb-d90123c191f3/edit?invitationId=inv_69175d66-8598-4268-a118-74f3b349cee5)
![Hackathon DFD](https://github.com/DanielGRasmussen/deadline_dynamo/assets/104102130/a0f030fa-f65f-4c7f-b909-e1b6e11bb85a)
* [Algorithm](https://docs.google.com/document/d/10U6tixkCaJ7YTuMz-V7MIQdTQslWUzbKkqV0isoQHfw/edit)
* [Algorithm Class Structure](https://docs.google.com/document/d/1KwZYufms0Ym5GPvqdC2z9oFNdyve-us4vFd5LU1scUc/edit)
* [Settings](https://docs.google.com/document/d/1c4JamHN8E8acj2UhTvIBsJOkSIrtuQO6hOkSEz1xNog/edit?usp=sharing)

## Credits 

**Daniel Rasmussen** -- Team Lead | Frontend Development | API Research and Implmentation | Web Extension Configuration
**Alex Musick** -- Backend Development | Algorithm Design | API Research
**Dallan Williams** -- Primary API Research and Implementation
**Derek Arima** -- API Research and Implementation

Built with Clyde D'Souza's Chrome Extension template: https://clydedsouza.net/
