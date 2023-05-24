import { collab } from '@codemirror/collab';
import CollabPlugin from './CollabPlugin';
import { ViewPlugin } from '@codemirror/view';

export const collabExtension = (startVersion, repositoryId, fileId) => {
  console.log('startVersion: ', startVersion)
  return [
    collab({ startVersion }),
    ViewPlugin.fromClass(function(view) { return new CollabPlugin(view, repositoryId, fileId) })
  ];
}