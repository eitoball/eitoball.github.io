var get_webhooks = function() {
  Trello.get("tokens/" + Trello.token() + "/webhooks",
    function(webhooks) {
      var body = $("#webhooks tbody");
      body.empty();
      $.each(webhooks, function(idx, webhook) {
        var row = $("<tr>").appendTo(body);
        var revoke = $("<button>").addClass("btn btn-danger").text("Revoke").attr("data-webhookId", webhook.id);
        revoke.click(function(e) {
          if (confirm("Revoke?")) {
            Trello.delete("tokens/" + Trello.token() + "/webhooks/" + $(this).data().webhookid,
                          function() { alert("Revoked"); get_webhooks(); },
                          function() { alert("Failed to revoke"); get_webhooks(); });
          }
        });
        Trello.boards.get(
          webhook.idModel,
          function(board) {
            $("<td>").text(board.name).appendTo(row);
            $("<td>").text(webhook.callbackURL).appendTo(row);
            $("<td>").text(webhook.description).appendTo(row);
            var item = $("<td>").appendTo(row);
            revoke.appendTo(item);
          },
          function() { });
      });
    },
    function() { });
};

var onAuthorized = function() {
  $("#authorized").show();
  $("#not-authorized").hide();
  Trello.members.get("me/boards", function(boards) {
    var select_boards = $("select#boards");
    $.each(boards, function(idx, board) {
      $("<option>").val(board.id).text(board.name).appendTo(select_boards);
    });
  });
  get_webhooks();
};

var onDenied = function() {
  alert("error");
};

var add_webhook = function(board_id, callback_url) {
  Trello.post("tokens/" + Trello.token() + "/webhooks", {
      description: "idobata",
      callbackURL: callback_url,
      idModel: board_id
    },
    function() {
      alert("Added");
      get_webhooks();
    },
    function() { alert("Failed"); }
  );
};

$(document).ready(function() {
    $("#authorized").hide();
    $("#not-authorized").show();

    $("#authorize").click(function(e) {
      Trello.authorize({
        type: "popup",
        name: "idobata Trello webhook",
        success: onAuthorized,
        error: onDenied
      });
    });

    $("#spinner").ajaxStart(function() { $(this).spin(); });
    $("#spinner").ajaxComplete(function() {
      $(this).spin(false);
    });

    $("#add_webhook").submit(function(e) {
      e.preventDefault();
      if (Trello.authorized()) {
        var board_id = $("#boards option:selected").val();
        var webhook_uri = $("#webhook_uri").val();
        if (! board_id) {
          alert("Select board");
        } else if (! webhook_uri) {
          alert("Enter webhook URI");
        } else {
          add_webhook(board_id, webhook_uri);
        }
      }
    });
});
