/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { localize } from '../../../../nls.js';
import { RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
import { ChatAgentLocation } from './chatAgents.js';

export const CONTEXT_RESPONSE_VOTE = new RawContextKey<string>('chatSessionResponseVote', '', { type: 'string', description: localize('interactiveSessionResponseVote', "When the response has been voted up, is set to 'up'. When voted down, is set to 'down'. Otherwise an empty string.") });
export const CONTEXT_RESPONSE_DETECTED_AGENT_COMMAND = new RawContextKey<boolean>('chatSessionResponseDetectedAgentOrCommand', false, { type: 'boolean', description: localize('chatSessionResponseDetectedAgentOrCommand', "When the agent or command was automatically detected") });
export const CONTEXT_CHAT_RESPONSE_SUPPORT_ISSUE_REPORTING = new RawContextKey<boolean>('chatResponseSupportsIssueReporting', false, { type: 'boolean', description: localize('chatResponseSupportsIssueReporting', "True when the current chat response supports issue reporting.") });
export const CONTEXT_RESPONSE_FILTERED = new RawContextKey<boolean>('chatSessionResponseFiltered', false, { type: 'boolean', description: localize('chatResponseFiltered', "True when the chat response was filtered out by the server.") });
export const CONTEXT_RESPONSE_ERROR = new RawContextKey<boolean>('chatSessionResponseError', false, { type: 'boolean', description: localize('chatResponseErrored', "True when the chat response resulted in an error.") });
export const CONTEXT_CHAT_REQUEST_IN_PROGRESS = new RawContextKey<boolean>('chatSessionRequestInProgress', false, { type: 'boolean', description: localize('interactiveSessionRequestInProgress', "True when the current request is still in progress.") });

export const CONTEXT_RESPONSE = new RawContextKey<boolean>('chatResponse', false, { type: 'boolean', description: localize('chatResponse', "The chat item is a response.") });
export const CONTEXT_REQUEST = new RawContextKey<boolean>('chatRequest', false, { type: 'boolean', description: localize('chatRequest', "The chat item is a request") });
export const CONTEXT_ITEM_ID = new RawContextKey<string>('chatItemId', '', { type: 'string', description: localize('chatItemId', "The id of the chat item.") });
export const CONTEXT_LAST_ITEM_ID = new RawContextKey<string[]>('chatLastItemId', [], { type: 'string', description: localize('chatLastItemId', "The id of the last chat item.") });

export const CONTEXT_CHAT_EDIT_APPLIED = new RawContextKey<boolean>('chatEditApplied', false, { type: 'boolean', description: localize('chatEditApplied', "True when the chat text edits have been applied.") });

export const CONTEXT_CHAT_INPUT_HAS_TEXT = new RawContextKey<boolean>('chatInputHasText', false, { type: 'boolean', description: localize('interactiveInputHasText', "True when the chat input has text.") });
export const CONTEXT_CHAT_INPUT_HAS_FOCUS = new RawContextKey<boolean>('chatInputHasFocus', false, { type: 'boolean', description: localize('interactiveInputHasFocus', "True when the chat input has focus.") });
export const CONTEXT_IN_CHAT_INPUT = new RawContextKey<boolean>('inChatInput', false, { type: 'boolean', description: localize('inInteractiveInput', "True when focus is in the chat input, false otherwise.") });
export const CONTEXT_IN_CHAT_SESSION = new RawContextKey<boolean>('inChat', false, { type: 'boolean', description: localize('inChat', "True when focus is in the chat widget, false otherwise.") });

export const CONTEXT_CHAT_ENABLED = new RawContextKey<boolean>('chatIsEnabled', false, { type: 'boolean', description: localize('chatIsEnabled', "True when chat is enabled because a default chat participant is activated with an implementation.") });
export const CONTEXT_CHAT_PANEL_PARTICIPANT_REGISTERED = new RawContextKey<boolean>('chatPanelParticipantRegistered', false, { type: 'boolean', description: localize('chatParticipantRegistered', "True when a default chat participant is registered for the panel.") });
export const CONTEXT_CHAT_EDITING_PARTICIPANT_REGISTERED = new RawContextKey<boolean>('chatEditingParticipantRegistered', false, { type: 'boolean', description: localize('chatEditingParticipantRegistered', "True when a default chat participant is registered for editing.") });
export const CONTEXT_CHAT_EDITING_CAN_UNDO = new RawContextKey<boolean>('chatEditingCanUndo', false, { type: 'boolean', description: localize('chatEditingCanUndo', "True when it is possible to undo an interaction in the editing panel.") });
export const CONTEXT_CHAT_EDITING_CAN_REDO = new RawContextKey<boolean>('chatEditingCanRedo', false, { type: 'boolean', description: localize('chatEditingCanRedo', "True when it is possible to redo an interaction in the editing panel.") });
export const CONTEXT_CHAT_EXTENSION_INVALID = new RawContextKey<boolean>('chatExtensionInvalid', false, { type: 'boolean', description: localize('chatExtensionInvalid', "True when the installed chat extension is invalid and needs to be updated.") });
export const CONTEXT_CHAT_INPUT_CURSOR_AT_TOP = new RawContextKey<boolean>('chatCursorAtTop', false);
export const CONTEXT_CHAT_INPUT_HAS_AGENT = new RawContextKey<boolean>('chatInputHasAgent', false);
export const CONTEXT_CHAT_LOCATION = new RawContextKey<ChatAgentLocation>('chatLocation', undefined);
export const CONTEXT_IN_QUICK_CHAT = new RawContextKey<boolean>('quickChatHasFocus', false, { type: 'boolean', description: localize('inQuickChat', "True when the quick chat UI has focus, false otherwise.") });
export const CONTEXT_CHAT_HAS_FILE_ATTACHMENTS = new RawContextKey<boolean>('chatHasFileAttachments', false, { type: 'boolean', description: localize('chatHasFileAttachments', "True when the chat has file attachments.") });

export const CONTEXT_LANGUAGE_MODELS_ARE_USER_SELECTABLE = new RawContextKey<boolean>('chatModelsAreUserSelectable', false, { type: 'boolean', description: localize('chatModelsAreUserSelectable', "True when the chat model can be selected manually by the user.") });

export const CONTEXT_CHAT_INSTALL_ENTITLED = new RawContextKey<boolean>('chatInstallEntitled', false, { type: 'boolean', description: localize('chatInstallEntitled', "True when the user is entitled for chat installation.") });
