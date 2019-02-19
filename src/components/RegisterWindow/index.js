import React, { Component } from 'react';
import {
    TextField,
    PrimaryButton,
    DefaultButton,
    Panel,
    PanelType
} from "office-ui-fabric-react";
import Mastodon from 'megalodon';

/**
 * The window used for handling registration of Hyperspace
 * to the user.
 */
class RegisterWindow extends Component {

    constructor(props) {
        super(props);

        this.state = {
            instanceUrl: '',
            modal: false,
            reauth: false,
            reauth_from_cookie: false,
            clientId: '',
            clientSecret: '',
            authUrl: '',
            authCode: ''
        };

        this.toggle = this.toggle.bind(this);
        this.toggle_reauth = this.toggle_reauth.bind(this);
        this._getErrorMessage = this._getErrorMessage.bind(this);
        this._getErrorMessagePromise = this._getErrorMessagePromise.bind(this);
    }

    componentDidMount() {
        if (localStorage.getItem("id") !== null) {
            this.setState({
                reauth_from_cookie: true,
                clientId: localStorage.getItem("id"),
                clientSecret: localStorage.getItem("secret"),
                authUrl: localStorage.getItem("authurl")
            })
        } 
    }

    toggle() {
        if (this.state.instanceUrl === '') {
            this.setState({
                instanceUrl: 'mastodon.social'
            })
        }
        this.createAuthApp();
        this.setState({
            modal: !this.state.modal
        });
    }

    toggle_reauth() {
        this.setState({
            reauth: !this.state.reauth
        });
    }

    closePanel() {
        this.setState({
            modal: false,
            reauth: false
        })
    }
    

    updateInstanceUrl(e) {
        let _this = this;
        _this.setState({
            instanceUrl: e.target.value
        })
    }

    _getErrorMessage(value) {
        return value.length > 0 ? '': 'This field cannot be blank.';
    }

    _getErrorMessagePromise(value) {
        return new Promise(resolve => {
            setTimeout(() => resolve(this._getErrorMessage(value)), 3000);
        });
    }

    updateAuthCode(e) {
        let _this = this;
        _this.setState({
            authCode: e.target.value
        })
    }


    createAuthApp() {
        let _this = this;
        const scopes = 'read write follow';
        const baseurl = 'https://' + _this.state.instanceUrl;

        Mastodon.registerApp('Hyperspace', {
            scopes: scopes
        }, baseurl).then(appData => {
            _this.setState({
                clientId: appData.client_id,
                clientSecret: appData.client_secret,
                authUrl: appData.url
            })
            localStorage.setItem("id", appData.client_id)
            localStorage.setItem("secret", appData.client_secret)
            localStorage.setItem("authurl", appData.url)
        });

        localStorage.setItem("baseurl", baseurl);
    }

    getAccessToken() {
        let _this = this;
        Mastodon.fetchAccessToken(_this.state.clientId, _this.state.clientSecret, _this.state.authCode, localStorage.getItem("baseurl"))
            .then((tokenData) => {
                let token = tokenData.accessToken;
                console.log(token);
                localStorage.setItem("access_token", token);
                localStorage.removeItem("id");
                localStorage.removeItem("secret");
                localStorage.removeItem("authurl");
                window.location.reload();
            })
            .catch((err) => console.error(err))
    }

    getPanelStyles() {
        return {
            closeButton: {
                color: 'transparent',
                    "&:hover": {
                    color: 'transparent !important'
                },
                "&:active": {
                    color: 'transparent !important'
                },
                backgroundImage: 'url(\'close.svg\')',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '50%'
            }
        }
    }

    getDarkMode() {
        if (localStorage.getItem('prefers-dark-mode') === "true") {
            return 'dark';
        } else {
            return '';
        }
    }

    render() {
        let _this = this;
        return (
            <div className = "container shadow-sm p-4 mt-4 marked-area">
                <h2>Sign in to Hyperspace</h2>
                <p>Welcome to Hyperspace, the fluffy client for Mastodon! We're more than happy to make your experience pleasant, but we'll need you to sign in to your Mastodon account first.</p>
                <p>
                    Please sign in by entering your Mastodon instance's domain. This is typically the domain name of the instance or the URL used to access that instance.
                </p>
                <div>
                    <TextField
                        prefix="https://"
                        label="Host domain name"
                        description="The base URL of your Mastodon instance"
                        onBlur={e => this.updateInstanceUrl(e)}
                        required={true}
                        onGetErrorMessage={this._getErrorMessage}
                        validateOnFocusOut
                    />
                    {
                        this.state.reauth_from_cookie ?
                        <div className = "container rounded shadow p-3 my-2 marked-area">
                            <h5>Finish sign-in</h5>
                            <p>
                                We noticed you didn't finish setting up Hyperspace. You can start over or pick up where you left off.
                            </p>
                            <PrimaryButton onClick={() => this.toggle_reauth()} style={{marginRight: 8}}>Finish sign-in</PrimaryButton>
                            <DefaultButton onClick={() => this.toggle()}>Start over</DefaultButton>
                        </div>:
                        <PrimaryButton onClick={this.toggle} style={{marginRight: 8, marginTop: 4}}>Sign in</PrimaryButton>

                    }
                </div>

                <Panel
                    isOpen={this.state.modal}
                    type={PanelType.medium}
                    onDismiss={() => this.closePanel()}
                    headerText="Give authorization access"
                    closeButtonAriaLabel="Close"
                    styles={this.getPanelStyles()}
                    className={this.getDarkMode()}
                    onRenderFooterContent = { () => {return(
                        <div>
                            <PrimaryButton
                                onClick={() => this.getAccessToken()}
                                style={{ marginRight: '8px' }}
                                text="Authorize" />
                            <DefaultButton
                                onClick={() => this.closePanel()}
                                text="Cancel" />
                        </div>
                        );}
                    }
                >
                    <p>We'll need you to grant Hyperspace authorization to access your Mastodon account on <b>{_this.state.instanceUrl}</b>. Click 'Get Code' to authorize and then paste the authorization code here.</p>
                    <DefaultButton
                        href={this.state.authUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                    >Get code</DefaultButton>
                    <TextField
                        label="Authorization code"
                        onBlur={e => this.updateAuthCode(e)}
                    />
                </Panel>

                <Panel
                    isOpen={this.state.reauth}
                    type={PanelType.medium}
                    onDismiss={() => this.closePanel()}
                    headerText="Finish setup"
                    closeButtonAriaLabel="Close"
                    styles={this.getPanelStyles()}
                    className={this.getDarkMode()}
                    onRenderFooterContent = { () => {return(
                        <div>
                            <PrimaryButton
                                onClick={() => this.getAccessToken()}
                                style={{ marginRight: '8px' }}
                                text="Authorize" />
                            <DefaultButton
                                onClick={() => this.closePanel()}
                                text="Cancel" />
                        </div>
                        );}
                    }
                >
                    <p>Paste the authroization token from when you signed in and authorized Hyperspace. If you have forgotten or need to re-assign access, click <b>Reacquire code</b> to reset. Optionally, you may cancel and press 'Start over'.</p>
                    <DefaultButton
                        href={this.state.authUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                    >Reacquire code</DefaultButton>
                    <TextField
                        label="Authorization code"
                        onBlur={e => this.updateAuthCode(e)}
                    />
                </Panel>
            </div>
        );
    }
}

export default RegisterWindow;