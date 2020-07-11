require('./routehandlers');

var Joi = require('joi');

AA.routes = {
    userapp: {
        path: "/userapp",
        method: 'GET',
        handler: AA.routeHandlers.userapp
    },
    userappHome: {
        path: "/userapp/home",
        method: 'GET',
        config: {
           auth: 'session',
           handler: AA.routeHandlers.userapp
        }
    },
    userappChat: {
        path: "/userapp/chat",
        method: 'GET',
        config: {
           auth: 'session',
           handler: AA.routeHandlers.userapp
        }
    },
    home: {
        path: "/home",
        method: 'GET',
        config: {
           auth: 'session',
           handler: AA.routeHandlers.home
        }
    },
    // share
    share_old: {
      path: "/share",
      method: 'GET',
      config: {
         auth: false,
         handler: AA.routeHandlers.share_old
      }
    },
    //update agent(user)
    updateAgentAccount: {
        path: "/agent/account",
        method: 'POST',
        config: {
           auth: 'session',
           handler: AA.routeHandlers.updateAgentAccount
        }
    },
    getAgentProfilePublic: {
        path: "/public/agent/profile/{userId}",
        method: 'GET',
        config: {
           auth: false,
           handler: AA.routeHandlers.getAgentProfilePublic
        }
    },
    getAgentProfile: {
        path: "/agent/profile",
        method: 'GET',
        config: {
           auth: 'session',
           handler: AA.routeHandlers.getAgentProfile
        }
    },
    //agent account operations
    deactivateAgentAccount: {
        path: "/agent/deactivate-account",
        method: 'GET',
        config: {
           auth: 'session',
           handler: AA.routeHandlers.deactivateAccount
        }
    },
    activateAgentAccount: {
        path: "/agent/activate-account",
        method: 'GET',
        config: {
           auth: 'session',
           handler: AA.routeHandlers.activateAccount
        }
    },
    resendAgentConfirmationEmail: {
        path: "/agent/resend-confirmation-email",
        method: 'GET',
        config: {
           auth: 'session',
           handler: AA.routeHandlers.resendConfirmationEmail
        }
    },
    notifyAgentSupport: {
        path: "/agent/notify-support-account-approval",
        method: 'GET',
        config: {
           auth: 'session',
           handler: AA.routeHandlers.notifySupportForAgentAccountApproval
        }
    },
    //home page updates
    getAgentJobs: {
        path: "/agent/jobs",
        method: 'GET',
        config: {
           auth: 'session',
           handler: AA.routeHandlers.getAgentJobs
        }
    },
    approveAgent: {
        path: "/agent/{agentId}/approve",
        method: 'GET',
        config: {
           auth: 'session',
           handler: AA.routeHandlers.approveAgent
        }
    },
    remindAgent: {
        path: "/agent/{agentId}/resend-agent-agreement-email",
        method: 'GET',
        config: {
           auth: 'session',
           handler: AA.routeHandlers.resendAgentAgreementEmail
        }
    },
    getAgentActiveClients: {
        path: "/agent/activeClients",
        method: 'GET',
        config: {
           auth: 'session',
           handler: AA.routeHandlers.getAgentActiveClients
        }
    },
    //account
    account: {
        path: "/account",
        method: 'GET',
        config: {
           auth: 'session',
           handler: AA.routeHandlers.account
        }
    },
    //account update
    agentAccountUpdate: {
        path: "/account/agent",
        method: 'POST',
        config: {
           auth: 'session',
           handler: AA.routeHandlers.agentAccountUpdate
        }
    },
    //initial -trip
    addInitialTripDetails: {
      path: "/initial-trip-details",
      method: 'POST',
      config: {
         auth: 'session',
         handler: AA.routeHandlers.addInitialTripDetails
      }
    },
    //initial -trip active chats
    numActiveChatsForTrip: {
      path: "/trip/{tripid}/numActiveChats",
      method: 'GET',
      config: {
         auth: 'session',
         handler: AA.routeHandlers.numActiveChatsForTrip
      }
    },
    //trip
    findTrip: {
        path: "/trip/{tripid}",
        method: 'GET',
        config: {
           auth: 'session',
           handler: AA.routeHandlers.findTrip
        }
    },
    updateTrip: {
        path: "/trip/{tripId}",
        method: 'POST',
        config: {
           auth: 'session',
           handler: AA.routeHandlers.updateTrip
        }
    },
    updateItenerary: {
        path: "/trip/{tripid}/updateItenerary",
        method: 'POST',
        config: {
           auth: 'session',
           handler: AA.routeHandlers.updateItenerary
        }
    },
    emailItenerary: {
        path: "/trip/{tripid}/emailItenerary",
        method: 'PUT',
        config: {
           auth: 'session',
           handler: AA.routeHandlers.emailItenerary
        }
    },
    shareItenerary: {
        path: "/trip/{tripid}/shareItenerary",
        method: 'POST',
        config: {
           auth: 'session',
           handler: AA.routeHandlers.shareItenerary
        }
    },
    share: {
        path: "/trip/{tripid}/share",
        method: 'GET',
        config: {
           auth: false,
           handler: AA.routeHandlers.share
        }
    },
    download: {
        path: "/trip/{tripid}/itinerary/download",
        method: 'GET',
        config: {
           auth: false,
           handler: AA.routeHandlers.download
        }
    },
    getItinerary: {
        path: "/trip/{tripid}/getItinerary",
        method: 'GET',
        config: {
           auth: 'session',
           handler: AA.routeHandlers.getItinerary
        }
    },
    getAgentForTrip: {
        path: "/trip/{tripid}/agent",
        method: 'GET',
        config: {
           auth: false,
           handler: AA.routeHandlers.getAgentForTrip
        }
    },
    inviteToTrip: {
        path: "/trip/{tripid}/invite",
        method: 'POST',
        config: {
           auth: 'session',
           handler: AA.routeHandlers.inviteToTrip
        }
    },
    isOwnerOfTrip: {
        path: "/trip/{tripid}/isowner",
        method: 'GET',
        config: {
           auth: 'session',
           handler: AA.routeHandlers.isOwnerOfTrip
        }
    },
    updateTripPayment: {
        path: "/trippayment/{trippaymentid}",
        method: 'POST',
        config: {
           auth: 'session',
           handler: AA.routeHandlers.updateTripPayment
        }
    },
    getTripPayment: {
        path: "/trippayment/{trippaymentid}",
        method: 'GET',
        config: {
           auth: 'session',
           handler: AA.routeHandlers.getTripPayment
        }
    },
    getTripPaymentAmount: {
        path: "/trippayment/{trippaymentid}/short",
        method: 'GET',
        config: {
           auth: 'session',
           handler: AA.routeHandlers.getTripPaymentShort
        }
    },
    createTripPayment: {
        path: "/trippayment",
        method: 'PUT',
        config: {
           auth: 'session',
           handler: AA.routeHandlers.createTripPayment
        }
    },
    //user app apis
    getNewChats: {
        path: "/user/newchats",
        method: 'GET',
        config: {
           auth: 'session',
           handler: AA.routeHandlers.getNewChats
        }
    },
    getActiveChats: {
        path: "/user/activechats",
        method: 'GET',
        config: {
           auth: 'session',
           handler: AA.routeHandlers.getActiveChats
        }
    },
    getInvitedChats: {
        path: "/user/invitedchats",
        method: 'GET',
        config: {
           auth: 'session',
           handler: AA.routeHandlers.getInvitedChats
        }
    },
    //images
    getFile: {
        path: "/file/{id}",
        method: 'GET',
        config: {
          auth: false,
          handler: AA.routeHandlers.getFile
        }
    },
    uploadFile: {
        path: "/file",
        method: 'POST',
        config: {
          payload:{
            maxBytes: 10000000,
            output:'stream',
            parse: true
          },
          auth: 'session',
          handler: AA.routeHandlers.uploadFile
        }
    },
    deleteFile: {
        path: "/file/{id}",
        method: 'DELETE',
        config: {
          auth: 'session',
          handler: AA.routeHandlers.deleteFile
        }
    },
    updateProfilePicture: {
        path: "/user/picture",
        method: 'POST',
        config: {
          auth: 'session',
          handler: AA.routeHandlers.updateProfilePicture
        }
    },
    uploadCKEditorImage: {
        path: "/ckeditor/image",
        method: 'POST',
        config: {
          payload:{
            maxBytes: 10000000,
            output:'stream',
            parse: true
          },
          auth: 'session',
          handler: AA.routeHandlers.uploadCKEditorImage
        }
    },
    //chat
    chat: {
        path: "/chat",
        method: 'GET',
        config: {
           auth: 'session',
           handler: AA.routeHandlers.chat
        }
    },
    chatUnreadMessageCount: {
      path: "/chat/{chatid}/unread-count",
      method: 'GET',
      config: {
         auth: 'session',
         handler: AA.routeHandlers.chatUnreadMessageCount
      }
    },
    chatClearUnreadMessages: {
      path: "/chat/{chatid}/clear-unread",
      method: 'DELETE',
      config: {
         auth: 'session',
         handler: AA.routeHandlers.chatClearUnreadMessages
      }
    },
    declineChat: {
      path: "/chat/{chatid}/decline",
      method: 'POST',
      config: {
         auth: 'session',
         handler: AA.routeHandlers.declineChat
      }
    },
    endChat: {
      path: "/chat/{chatid}/end",
      method: 'POST',
      config: {
         auth: 'session',
         handler: AA.routeHandlers.endChat
      }
    },
    markChatAsSuccess: {
      path: "/chat/{chatid}/success",
      method: 'GET',
      config: {
         auth: 'session',
         handler: AA.routeHandlers.markChatAsSuccess
      }
    },
    startChat: {
      path: "/chat/{chatid}/start",
      method: 'GET',
      config: {
         auth: 'session',
         handler: AA.routeHandlers.startChat
      }
    },
    clearChat: {
      path: "/chat/{chatid}/clear",
      method: 'GET',
      config: {
         auth: 'session',
         handler: AA.routeHandlers.clearChat
      }
    },
    loadChat: {
      method: 'GET',
      path: '/loadChat/{chatid}',
      config: {
         auth: 'session',
         handler: require('./livechat/chat_message_service').loadChat
      }
    },
    getUserInfo: {
      method: 'GET',
      path: '/userinfo',
      config: {
         auth: 'session',
         handler: AA.routeHandlers.userinfo
      }
    },
    isSessionTimedout: {
      method: 'GET',
      path: '/wassup',
      config: {
        plugins: { 'hapi-auth-cookie': { redirectTo: false } },
        auth: {
           mode: 'try',
           strategy: 'session'
        },
        handler: AA.routeHandlers.isSessionTimedout
      }
    },
    getAgentInfoByChatId: {
      method: 'GET',
      path: '/agentinfo/{chatid}',
      config: {
         auth: 'session',
         handler: AA.routeHandlers.getAgentInfoByTripId
      }
    },
    //public routes
    all: {
        path: '/{param*}',
        method: 'GET',
        config: {
           auth: false,
           handler: {
              directory: {
                path: 'public'
              }
          }
        }
    },
    index: {
        path: '/',
        method: 'GET',
        handler: AA.routeHandlers.index
    },
    profile: {
        path: '/profile/{usrId}',
        method: 'GET',
        handler: AA.routeHandlers.profile
    },
    about: {
        path: '/about',
        method: 'GET',
        handler: AA.routeHandlers.about
    },
    privacy: {
        path: '/privacy',
        method: 'GET',
        handler: AA.routeHandlers.privacy
    },
    agentLogin: {
        path: '/all-login',
        method: 'GET',
        config: {
           auth: false,
           handler: AA.routeHandlers.login
        }
    },
    login: {
        path: '/login',
        method: 'GET',
        config: {
           auth: false,
           handler: AA.routeHandlers.login
        }
    },
    agentSignup: {
        path: '/agent-signup',
        method: ['GET', 'POST'],
        config: {
           auth: false,
           handler: AA.routeHandlers.signup
        }
    },
    userSignup: {
        path: '/user-signup',
        method: ['GET', 'POST'],
        config: {
           auth: false,
           handler: AA.routeHandlers.userSignup,
           state: {
              parse: false,
              failAction: 'ignore'
           }
        }
    },
    forgotPassword: {
        path: '/forgot_password',
        method: ['GET', 'POST'],
        config: {
           auth: false,
           handler: AA.routeHandlers.forgotPassword
        }
    },
    resetPassword: {
        path: '/reset_password',
        method: ['GET', 'POST'],
        config: {
           auth: false,
           handler: AA.routeHandlers.resetPassword
        }
    },
    accountConfirm: {
        path: '/confirm',
        method: 'GET',
        config: {
           auth: false,
           handler: AA.routeHandlers.confirm
        }
    },
    email: {
        path: "/email-not-duplicate",
        method: 'GET',
        config: {
           auth: false,
           handler: AA.routeHandlers.checkDuplicateEmail
        }
    },
    agentAgreement: {
        path: '/agent-agreement',
        method: ['GET', 'POST'],
        config: {
           auth: false,
           handler: AA.routeHandlers.agentAgreement
        }
    },
    verified: {
        path: '/verified',
        method: 'GET',
        config: {
           auth: false,
           handler: AA.routeHandlers.verified
        }
    },
    notFound: {
        path: '/not-found',
        method: 'GET',
        config: {
           auth: false,
           handler: AA.routeHandlers.notFound
        }
    },
    chatPluginDemo: {
        path: '/chat-plugin-demo',
        method: 'GET',
        config: {
           auth: false,
           handler: AA.routeHandlers.chatPluginDemo
        }
    },
    fbMessengerWebhookVerify: {
      path: '/fb/messenger',
      method: 'GET',
      config: {
         auth: false,
         handler: AA.routeHandlers.fbMessengerWebhookVerify
      }
    }
};

AA.RegisterRoutes = function () {
    for (var i in AA.routes) {
        if (AA.routes.hasOwnProperty(i)) {
            AA.Server.route(AA.routes[i]);
        }
    }
};
