var chat;
var $onlineUsers = $('.online-users');
var $messages = $('.messages-content');
var $messageBox = $('.message-box');
var $closeBtn = $('.close-btn');

$(function () {
    showModalUserNickName();
    $onlineUsers.addClass('shown');
    $messages.mCustomScrollbar();
});

function showModalUserNickName() {
    alertify.prompt("Enter your name to start:", "Biser Sirakov",
        function (evt, value) {
            $('#nickname').val(value);
            $('.chat-title h1 span').html(value);
            startChartHub();
        })
        .setHeader('Welcome to MyChat')
        .set({ transition: 'fade' })
        .set('labels', { ok: 'Enter' });
}

function startChartHub() {
    chat = $.connection.myChatHub;

    chat.client.differentName = function (name) {
        alertify.error('Name in use');
        showModalUserNickName();
        return false;

        $('#nickname').val($('#nick').val());
        chat.server.notify($('#nickname').val(), $.connection.hub.id);
    };

    chat.client.online = function (name) {
        if (name != $('#nickname').val()) {
            $onlineUsers.append('<div class="online-user"><h1>' + name + '</h1><figure class="avatar"><img src="/Images/avatar.jpg" /></figure></div>');
            // add new messages-content

        }
    };

    chat.client.enters = function (name) {
        alertify.success(name + ' joined the chat');
        $onlineUsers.append('<div class="online-user"><h1>' + name + '</h1><figure class="avatar"><img src="/Images/avatar.jpg" /></figure></div>');
            // add new messages-content

    };

    chat.client.broadcastMessage = function (name, message) {
        message = message.replace(":)", "<img src=\"/images/smile.gif\" class=\"smileys\" />");
        message = message.replace("lol", "<img src=\"/images/laugh.gif\" class=\"smileys\" />");
        message = message.replace(":o", "<img src=\"/images/cool.gif\" class=\"smileys\" />");

        if ($.trim(message) == '') {
            return false;
        }

        if (name == $('#nickname').val()) {
            $('<div class="message message-personal">' + message + '</div>').appendTo($('.mCSB_container')).addClass('new');
        }
        else {
            $('<div class="message new"><figure class="avatar"><img src="/Images/avatar.jpg" /></figure>' + message + '</div>').appendTo($('.mCSB_container')).addClass('new');
        }

        updateScrollbar();
    };

    chat.client.disconnected = function (name) {
        alertify.error(name + ' left the chat');
        $('.online-user').remove(":contains('" + name + "')");
    }

    $.connection.hub.start().done(function () {
        chat.server.notify($('#nickname').val(), $.connection.hub.id);
        
        $(window).on('keydown', function (e) {
            if (e.which == 13) {
                insertMessage();
                return false;
            }
        });
    });

    $('.message-input').focus();
}

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
                chat.server.send($('#nickname').val(), '<a class="uploaded-file" download target="_blank" href="/Uploads/' + data.fileName + '"><i class="fa fa-file" aria-hidden="true"></i> ' + data.fileName + '</a>');
            }
        });
    }
});

$onlineUsers.on('click', '.online-user', function () {
    $onlineUsers.removeClass('shown');
    $messages.addClass('shown');
    $messageBox.addClass('shown');
    $closeBtn.addClass('shown');

    var user = $(this).children('h1').text();

    $('.chat-title figure img').attr('src', '/Images/avatar.jpg');
    $('.chat-title h1 span').html(user);
    $('#to').val(user);
});

$closeBtn.on('click', function () {
    $closeBtn.removeClass('shown');
    $messages.removeClass('shown');
    $messageBox.removeClass('shown');
    $onlineUsers.addClass('shown');

    $('.chat-title figure img').attr('src', '/Images/profile-80.jpg');
    $('.chat-title h1 span').html($('#nickname').val());
});

function insertMessage() {
    //chat.server.send($('#nickname').val(), $('.message-input').val());
    chat.server.sendToSpecific($('#nickname').val(), $('.message-input').val(), $("#to").val());
    updateScrollbar();
    $('.message-input').val(null);
}

function updateScrollbar() {
    $messages.mCustomScrollbar("update").mCustomScrollbar('scrollTo', 'bottom', {
        scrollInertia: 10,
        timeout: 0
    });
}