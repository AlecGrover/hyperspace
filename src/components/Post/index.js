import React, { Component } from 'react';
import {
    Persona, DocumentCard, DocumentCardActivity, DocumentCardTitle, DocumentCardType, DocumentCardDetails, TooltipHost } from "office-ui-fabric-react";
import * as moment from 'moment';
import PostContent from './PostContent';
import PostDate from './PostDate';
import PostToolbar from './PostToolbar';
import PostSensitive from './PostSensitive';
import ProfilePanel from '../ProfilePanel';
import { getInitials } from '@uifabric/utilities/lib/initials.js';

class Post extends Component {
    id;
    client;

    constructor(props) {
        super(props);
        this.id = this.props.key;
        this.client = this.props.client;

        console.log(this.nothread);

        this.state = {
            noLink: this.props.nolink,
            noThread: this.props.nothread
        }
    }

    getBigShadow() {
        if (this.props.bigShadow) {
            return 'shadow'
        } else {
            return 'shadow-sm'
        }
    }

    getAuthorName(account) {
        let x;
        try {
            x = account.display_name;
            if (x === '') {
                x = account.acct;
            }
            getInitials(x);
        } catch (error) {
            console.err(error);
            x = account.acct;
        }
        return x
    }

    getInitialsOfUser(account) {
        try {
            return getInitials(account.display_name);
        } catch (error) {
            return 'MU'
        }
    }

    getApplicationName(status) {
        if (status.application === null || status.application === undefined) {
            return (
                <TooltipHost content="We couldn't identify the application used to post this status.">
                    <span><b>determination (Web)</b></span>
                </TooltipHost>
            );
        } else {
            return <span><b>{status.application.name}</b></span>;
        }
    }

    getVisibility(status) {
        if (status.visibility === 'public') {
            return 'Public';
        } else if (status.visibility === 'unlisted') {
            return 'Unlisted';
        } else if (status.visibility === 'private') {
            return 'Followers only';
        } else {
            return 'Direct message';
        }
    }

    getPersonaText() {
        if (this.state.noLink) {
            return <b>{this.getAuthorName(this.props.status.account)}</b>;
        } else {
            return <ProfilePanel account={this.props.status.account} client={this.client}/>;
        }
    }

    getBoostCard(status) {
        if (status.reblog) {

            let documentCardStyles = {};

            let temporaryDiv = document.createElement("div");
            temporaryDiv.innerHTML = status.reblog.content;
            let actualContent = temporaryDiv.textContent || temporaryDiv.innerText || "";

            if (status.reblog.media_attachments.length !== 0 || actualContent.length > 150) {
                documentCardStyles = {
                    root: {
                        height: 200
                    }
                }
            }

            return (
                <div className='mt-1 ml-4 mb-1'>
                    <div>
                        { status.sensitive === true ?
                            <PostSensitive status={this.props.status}/>:

                            <div className='ml-4 mb-2'>
                                <DocumentCard
                                    type={DocumentCardType.compact}
                                    onClick={() => {window.open(status.reblog.url)}}
                                    styles={documentCardStyles}
                                >
                                    <DocumentCardDetails>
                                        <DocumentCardTitle
                                            title={
                                                <div>
                                                    <div dangerouslySetInnerHTML={{__html: status.reblog.content}}/>
                                                    {
                                                        status.reblog.media_attachments.length ?
                                                            <div className = "row">
                                                                {
                                                                    status.reblog.media_attachments.map( function(media) {
                                                                        return(
                                                                            <div className="col" key={'media' + media.id}>
                                                                                {
                                                                                    (media.type === "image") ?
                                                                                        <img src={media.url} className = "shadow-sm rounded" alt={media.description} style = {{ width: '100%' }}/>:
                                                                                        <video src={media.url} autoPlay={false} controls={true} className = "shadow-sm rounded" alt={media.description} style = {{ width: '100%' }}/>
                                                                                }
                                                                            </div>
                                                                        );
                                                                    })
                                                                }
                                                            </div>:
                                                            <span/>
                                                    }
                                                </div>
                                            }
                                            shouldTruncate={true}
                                            showAsSecondaryTitle={true}
                                            styles={documentCardStyles}
                                        />
                                        <DocumentCardActivity
                                            activity={"Originally posted on " + moment(this.props.status.reblog.date).format("MMM Do, YYYY: h:mm A")}
                                            people={[{ name: this.props.status.reblog.account.acct, profileImageSrc: this.props.status.reblog.account.avatar}]}
                                        />
                                    </DocumentCardDetails>
                                </DocumentCard>
                            </div>}
                    </div>
                </div>
            );
        }
    }

    render() {
        return (<div className={"container rounded p-3 marked-area " + this.getBigShadow()}>
                {
                        <Persona {... {
                            imageUrl: this.props.status.account.avatar,
                            text: this.getPersonaText(),
                            imageInitials: this.getInitialsOfUser(this.props.status.account),
                            secondaryText: '@' + this.props.status.account.acct
                        } } />
                }
                <PostContent>
                    {

                        this.props.status.reblog ?
                            this.getBoostCard(this.props.status):

                            <div className='mb-2'>
                                { this.props.status.sensitive === true ?
                                    <PostSensitive status={this.props.status}/>:
                                    <div>
                                        <p dangerouslySetInnerHTML={{__html: this.props.status.content}} />
                                        {
                                            this.props.status.media_attachments.length ?
                                                <div className = "row">
                                                    {
                                                        this.props.status.media_attachments.map( function(media) {
                                                            return(
                                                                <div key={'media' + media.id} className="col">
                                                                    {
                                                                        (media.type === "image") ?
                                                                            <img src={media.url} className = "shadow-sm rounded" alt={media.description} style = {{ width: '100%' }}/>:
                                                                            <video src={media.url} autoPlay={false} controls={true} className = "shadow-sm rounded" alt={media.description} style = {{ width: '100%' }}/>
                                                                    }
                                                                </div>
                                                            );
                                                        })
                                                    }
                                                </div>:
                                                <span/>
                                        }
                                    </div>}
                            </div>
                    }

                </PostContent>
                <PostToolbar
                    client={this.props.client}
                    status={this.props.status}
                    nothread={this.props.nothread}
                />
                <PostDate date={<span>{moment(this.props.status.created_at).format('MM/DD/YYYY [at] h:mm A')} via {this.getApplicationName(this.props.status)} ({this.getVisibility(this.props.status)})</span>}/>
            </div>
        );
    }
}

export default Post;