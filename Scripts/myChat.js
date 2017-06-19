var $onlineUsers = $('.online-users');
var $messageBox = $('.message-box');
var $closeBtn = $('.close-btn');

$(function () {
    showModalUserLogin();
    $('#group-chat').mCustomScrollbar();
});

function showModalUserLogin() {
    var prompt = alertify.prompt("Enter your name to start:", "Biser Sirakov",
        function (e, name) {
            $('#nickname').val(name.toUpperCase());
            $('.chat-title h1 span').html(name);
            startChatHub();
        })
        .setHeader('Welcome to MyChat')
        .setting({
            'closableByDimmer': false,
            'closable': false,
            'movable': false,
            'transition': 'fade',
            'labels': { ok: 'Enter' }
        });

    var $cancelBtn = $(prompt.elements.footer.querySelector("button.ajs-cancel"));
    $cancelBtn.remove();
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

        // add cached messages (for group chat)
        messages.forEach(function (message) {
            if (message.UserName == $('#nickname').val()) {
                $('<div class="message message-personal">' + message.Message + '</div>').appendTo($('.messages-content[data="GROUP CHAT"] .mCSB_container')).addClass('new');
            }
            else {
                $('<div class="message new" style="margin-top: 20px;"><figure class="avatar"><img src="/Images/avatar.jpg" /></figure>' + message.Message + '<div class="message-username">' + message.UserName + '</div></div>').appendTo($('.messages-content[data="GROUP CHAT"] .mCSB_container')).addClass('new');
            }
        });

        $('.messages-content[data="GROUP CHAT"]').mCustomScrollbar();
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

    // for group chat
    chatHub.client.messageReceived = function (userName, message) {
        message = getEmoticons(message);
        if ($.trim(message) == '') {
            return false;
        }

        if (userName == $('#nickname').val()) {
            $('<div class="message message-personal">' + message + '</div>').appendTo($('.messages-content[data="GROUP CHAT"] .mCSB_container')).addClass('new');
        }
        else {
            $('<div class="message new" style="margin-top: 20px;"><figure class="avatar"><img src="/Images/avatar.jpg" /></figure>' + message + '<div class="message-username">' + userName + '</div></div>').appendTo($('.messages-content[data="GROUP CHAT"] .mCSB_container')).addClass('new');
        }

        updateScrollbar();
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
                    var msg = '<a class="uploaded-file" download target="_blank" href="/Uploads/' + data.fileName + '"><i class="fa fa-file" aria-hidden="true"></i> ' + data.fileName + '</a>';
                    if ($("#to").val() == 'GROUP CHAT') {
                        chatHub.server.sendMessageToAll($("#nickname").val(), msg);
                    }
                    else {
                        chatHub.server.sendPrivateMessage($("#to").val(), msg);
                    }

                    updateScrollbar();
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

        if (user == 'GROUP CHAT') {
            $('.chat-title figure').hide();
        }

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

        if ($('.chat-title figure').css('display') == 'none') {
            $('.chat-title figure').show();
        }

        $('.chat-title figure img').attr('src', '/Images/profile-80.jpg');
        $('.chat-title h1 span').html($('#nickname').val());
    });

    $('.message-input').on('keydown', function (e) {
        if (e.which == 13) {
            if ($("#to").val() == 'GROUP CHAT') {
                chatHub.server.sendMessageToAll($("#nickname").val(), $('.message-input').val());
            }
            else {
                chatHub.server.sendPrivateMessage($("#to").val(), $('.message-input').val());
            }

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
    message = message.replace(":)", "<img src=\"/images/emoticons/smile.gif\" class=\"smileys\" />");
    message = message.replace("lol", "<img src=\"/images/emoticons/laugh.gif\" class=\"smileys\" />");
    message = message.replace(":o", "<img src=\"/images/emoticons/cool.gif\" class=\"smileys\" />");

    return message;
}