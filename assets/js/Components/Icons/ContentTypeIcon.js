import React from 'react';
import ContentPageIcon from './ContentPageIcon';
import ContentAssignmentIcon from './ContentAssignmentIcon';
import ContentAnnouncementIcon from './ContentAnnouncementIcon';
import ContentDiscussionTopicIcon from './ContentDiscussionTopicIcon';
import ContentDiscussionForumIcon from './ContentDiscussionForumIcon';
import ContentFileIcon from './ContentFileIcon';
import ContentQuizIcon from './ContentQuizIcon';
import ContentSyllabusIcon from './ContentSyllabusIcon';

export default function ContentTypeIcon(props) {
  if(!props.type) {
    return null
  }

  switch(props.type) {
    case('PAGE'):
      return <ContentPageIcon {...props} />
    case('ASSIGNMENT'):
      return <ContentAssignmentIcon {...props} />
    case('ANNOUNCEMENT'):
      return <ContentAnnouncementIcon {...props} />
    case('DISCUSSION_TOPIC'):
      return <ContentDiscussionTopicIcon {...props} />
    case('DISCUSSION_FORUM'):
      return <ContentDiscussionForumIcon {...props} />
    case('FILE'):
    case('FILE_OBJECT'):
      return <ContentFileIcon {...props} />
    case('QUIZ'):
    case('QUIZ_QUESTION'):
      return <ContentQuizIcon {...props} />
    case('SYLLABUS'):
      return <ContentSyllabusIcon {...props} />
    default:
      return null
  }
}