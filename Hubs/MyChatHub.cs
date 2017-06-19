using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNet.SignalR;
using MyChat.Models;

namespace MyChat.Hubs
{
    public class MyChatHub : Hub
    {
        private static List<UserDetails> ConnectedUsers = new List<UserDetails>();
        private static List<MessageDetails> CurrentMessages = new List<MessageDetails>();

        public void Connect(string userName)
        {
            string id = Context.ConnectionId;
            if (!ConnectedUsers.Any(x => x.ConnectionId == id) && !ConnectedUsers.Any(x => x.UserName.ToLower() == userName.ToLower()))
            {
                ConnectedUsers.Add(new UserDetails { ConnectionId = id, UserName = userName });
                Clients.Caller.onConnected(userName, ConnectedUsers, CurrentMessages);
                Clients.Others.onNewUserConnected(userName);
            }
            else
            {
                Clients.Caller.differentName();
            }
        }

        public void SendMessageToAll(string userName, string message)
        {
            // store last 100 messages in cache
            AddMessageinCache(userName, message);

            Clients.All.messageReceived(userName, message);
        }

        public void SendPrivateMessage(string toUserName, string message)
        {
            string fromUserId = Context.ConnectionId;

            var toUser = ConnectedUsers.FirstOrDefault(x => x.UserName.ToUpper() == toUserName.ToUpper());
            var fromUser = ConnectedUsers.FirstOrDefault(x => x.ConnectionId == fromUserId);

            if (toUser != null && fromUser != null)
            {
                Clients.Client(toUser.ConnectionId).getMessage(fromUser.UserName.ToUpper(), message);
                Clients.Caller.getMyMessage(toUser.UserName.ToUpper(), message);
            }
        }

        public override Task OnDisconnected()
        {
            var id = Context.ConnectionId;
            var user = ConnectedUsers.FirstOrDefault(x => x.ConnectionId == id);
            if (user != null)
            {
                ConnectedUsers.Remove(user);
                Clients.All.onUserDisconnected(user.UserName);
            }

            return base.OnDisconnected();
        }
        
        private void AddMessageinCache(string userName, string message)
        {
            if (string.IsNullOrWhiteSpace(message))
            {
                return;
            }

            CurrentMessages.Add(new MessageDetails { UserName = userName, Message = message });

            if (CurrentMessages.Count > 100)
                CurrentMessages.RemoveAt(0);
        }
    }
}