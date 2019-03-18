import React, { Component } from 'react';
import { CommandBar, TextField, Callout, Dialog, DialogBase, DialogFooter } from 'office-ui-fabric-react';
import EmojiPicker from '../EmojiPicker';
import Mastodon from 'megalodon';
import { Status } from '../../types/Status';
import { Visibility } from '../../types/Visibility';
import { Attachment } from '../../types/Attachment';
import { anchorInBrowser } from '../../utilities/anchorInBrowser';
import { getDarkMode } from '../../utilities/getDarkMode';
import filedialog from 'file-dialog';

interface IComposableProps {
    client: Mastodon;
    reply_to?: Status;
}

interface IComposableState {
    status: string;
    mediaIds: string[];
    mediaObjects: Attachment[];
    visibility: Visibility;
    spoiler_text: string;
    sensitive: boolean;
    showMediaLoader: boolean;
    showEmojiPicker: boolean;
    isReply: boolean;
    replyId?: string;
}

/**
 * Base class for a composable element. Used to create new statuses
 * and replies to old ones.
 * 
 * @param client The Mastodon client used to post statuses
 * @param reply_to The reply to attach a status to, if applicable
 */
class Composable extends Component<IComposableProps, IComposableState> {
    client: Mastodon;

    constructor(props: any) {
        super(props);

        this.client = this.props.client;
        
        this.state = {
            status: '',
            mediaIds: [],
            mediaObjects: [],
            visibility: "public",
            spoiler_text: '',
            sensitive: false,
            showEmojiPicker: false,
            showMediaLoader: false,
            isReply: false
        }

        if (this.props.reply_to) {
            this.setState({
                isReply: true,
                replyId: this.props.reply_to.id
            });
        }
    }

    componentDidUpdate() {
        anchorInBrowser();
    }

    updateStatusText(e: any) {
        this.setState({
            status: e.target.value
        });
    }

    updateVisibility(newVisibility: Visibility) {
        this.setState({
            visibility: newVisibility
        });
    }

    uploadMedia() {
        let _this = this;
        filedialog({
            multiple: false,
            accept: 'image/*, video/*'
        })
        .then((images: any) => {
            let uploadFormData = new FormData();
            uploadFormData.append('file', images[0]);
            _this.setState({ showMediaLoader: true })

            _this.client.post('/media', uploadFormData)
                .then((resp: any) => {
                    let attachment: Attachment = resp.data;
                    let idArray = _this.state.mediaIds;
                    let objectArray = _this.state.mediaObjects;
                    
                    idArray.push(attachment.id);
                    objectArray.push(attachment);

                    _this.setState({
                        mediaIds: idArray,
                        mediaObjects: objectArray,
                        showMediaLoader: false
                    })
                });
        })
    }


}

export default Composable;