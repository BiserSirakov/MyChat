var $onlineUsers = $('.online-users');
var $messageBox = $('.message-box');
var $closeBtn = $('.close-btn');

$(function () {
    showModalUserLogin();
});

function showModalUserLogin() {
    alertify.prompt("Enter your name to start:", "Biser Sirakov",
        function (e, name) {
            $('#nickname').val(name.toUpperCase());
            $('.chat-title h1 span').html(name);
            startChatHub();
        })
        .setHeader('Welcome to MyChat')
        .set({ transition: 'fade' })
        .set('labels', { ok: 'Enter' });
}

function startChatHub() {
    var chatHub = $.connection.myChatHub;

    registerClientMethods(chatHub);

    $.connection.hub.start().done(function () {
        registerEvents(chatHub)
        chatHub.server.connect($('#nickname').val());
    });
}

function registerClientMethods(chatHub) {
    chatHub.client.differentName = function (name) {
        alertify.error('Name in use');
        showModalUserLogin();
    };

    chatHub.client.onConnected = function (name, allUsers, messages) {
        allUsers.forEach(function (user) {
            if (user.UserName != name) {
                $onlineUsers.append('<div class="online-user"><h1>' + user.UserName + '</h1><figure class="avatar"><img src="/Images/avatar.jpg" /></figure></div>');
                var $messagesContent = $('<div class="messages-content" data="' + user.UserName.toUpperCase() + '"></div>');
                $('.messages').append($messagesContent);
                $messagesContent.mCustomScrollbar();
            }
        });

        //// add existing messages (for general chat)
        //for (i = 0; i < messages.length; i++) {

        //    AddMessage(messages[i].UserName, messages[i].Message);
        //}
    }

    chatHub.client.onNewUserConnected = function (name) {
        name = name.toUpperCase();
        alertify.success(name + ' joined the chat');
        $onlineUsers.append('<div class="online-user"><h1>' + name + '</h1><figure class="avatar"><img src="/Images/avatar.jpg" /></figure></div>');
        var $messagesContent = $('<div class="messages-content" data="' + name.toUpperCase() + '"></div>');
        $('.messages').append($messagesContent);
        $messagesContent.mCustomScrollbar();
    }

    chatHub.client.onUserDisconnected = function (userName) {
        alertify.error(userName + ' left the chat');
        $('.online-user').remove(":contains('" + userName.toUpperCase() + "')");
        $('.messages-content[data="' + userName.toUpperCase() + '"]').remove();
    }

    chatHub.client.messageReceived = function (userName, message) {
        AddMessage(userName, message);
    }

    chatHub.client.getMessage = function (fromUserName, message) {
        message = getEmoticons(message);
        if ($.trim(message) == '') {
            return false;
        }

        $('<div class="message new"><figure class="avatar"><img src="/Images/avatar.jpg" /></figure>' + message + '</div>').appendTo($('.messages-content[data="' + fromUserName + '"] .mCSB_container')).addClass('new');
        updateScrollbar();
    }

    chatHub.client.getMyMessage = function (toUserName, message) {
        message = getEmoticons(message);
        if ($.trim(message) == '') {
            return false;
        }

        $('<div class="message message-personal">' + message + '</div>').appendTo($('.messages-content[data="' + toUserName + '"] .mCSB_container')).addClass('new');
        updateScrollbar();
    }
}

function registerEvents(chatHub) {
    $("#attachment").change(function (e) {
        e.preventDefault();
        var fd = new FormData();
        var input = document.querySelector("input#attachment");

        if (input.files[0]) {
            fd.append('file', input.files[0]);
            $.ajax({
                url: '/Home/UploadFile',
                data: fd,
                processData: false,
                contentType: false,
                type: 'POST',
                success: function (data) {
                    chatHub.server.sendPrivateMessage($("#to").val(), '<a class="uploaded-file" download target="_blank" href="/Uploads/' + data.fileName + '"><i class="fa fa-file" aria-hidden="true"></i> ' + data.fileName + '</a>');
                }
            });
        }
    });

    $onlineUsers.on('click', '.online-user', function () {
        var user = $(this).children('h1').text().toUpperCase();

        $onlineUsers.removeClass('shown');
        $('.messages-content[data="' + user + '"]').addClass('shown');
        $messageBox.addClass('shown');
        $closeBtn.addClass('shown');

        $('.chat-title figure img').attr('src', '/Images/avatar.jpg');
        $('.chat-title h1 span').html(user);
        $('#to').val(user);

        updateScrollbar();
    });

    $closeBtn.on('click', function () {
        $closeBtn.removeClass('shown');
        $('.messages-content[data="' + $("#to").val().toUpperCase() + '"]').removeClass('shown');
        $messageBox.removeClass('shown');
        $onlineUsers.addClass('shown');

        $('.chat-title figure img').attr('src', '/Images/profile-80.jpg');
        $('.chat-title h1 span').html($('#nickname').val());
    });

    $('.message-input').on('keydown', function (e) {
        if (e.which == 13) {
            chatHub.server.sendPrivateMessage($("#to").val(), $('.message-input').val());
            updateScrollbar();
            $('.message-input').val('');
        }
    });
}

function updateScrollbar() {
    $('.messages-content').mCustomScrollbar("update").mCustomScrollbar('scrollTo', 'bottom', {
        scrollInertia: 10,
        timeout: 0
    });
}

function getEmoticons(message) {
    message = message.replace(":)", "<img src=\"/images/smile.gif\" class=\"smileys\" />");
    message = message.replace("lol", "<img src=\"/images/laugh.gif\" class=\"smileys\" />");
    message = message.replace(":o", "<img src=\"/images/cool.gif\" class=\"smileys\" />");

    return message;
}