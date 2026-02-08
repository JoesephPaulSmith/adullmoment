# Project Context

When creating and working with this codebase, prioritize readability over cleverness. Ask clarifying questions before making architectural changes. 

## About This Project

We are going to create a progressive web app, mobile first aide with a psychological goal. This app, entitled "A Dull Moment", will allow users to select a picture on their device to look at and hopefully think about at scheduled moments throughout the day. The app is meant to be an interruption to the relentless, daily stream of information from news sites, social media apps, and more, bringing a renewed focus to the user's personal goals in life. The picture the user chooses does not necessarily need to be related to those goals, as the app's function is to distract and interrupt the stream of information battering the user so they can refocus on more important things.

## Implementation details

When the app is opened, the user is shown the picture they have chosen previously and that picture is either fit to screen - with a chosen background color or gradient to fill in where the picture cannot - or full screen. If they haven't chosen a picture, a form field is presented prompting the user to pick a picture. This will utilize system dialogs to identify and load a picture into local storage. As this app can be opened in different browsers, different browsers can have different pictures, and that is OK. Once a picture is selected, users should tap an OK button to store the new image in local storage, or there's a cancel button to not pick an image. Tapping either button should lead the user to the picture display mode.

In the mode where the picture is shown in full screen, if a user taps it, a few things appear: 1. in the upper right corner an X button to close the app, 2. in the upper left corner, a picture icon button to pull up the picture selection form previously described, and 3. a calendar icon button in the bottom left corner to schedule a reminder (device calendar, google calendar, or other calendar) to set aside time to look at the image and relax. We can also, if possible, utilize (non push) notifications. I wouldn't know the implementation details but also if that is not possible that is OK.

## Standards

- 4 space indents
- More to be determined

## Notes

- Calendar reminders are always recurring events (daily, weekdays, or weekly). Users cancel a series from their own calendar app — that's not our concern.
- Outlook's compose deeplink doesn't support recurrence parameters, so Outlook uses .ics file download (same as iCal) to preserve the RRULE.
