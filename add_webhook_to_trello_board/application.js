var onAuthorized = function() {
  $("#authorized").show();
  $("#not-authorized").hide();
  Trello.members.get("me/boards", function(boards) {
    var select_boards = $("select#boards");
    $.each(boards, function(idx, board) {
      $("<option>").val(board.id).text(board.name).appendTo(select_boards);
    });
  });
  Trello.get("tokens/" + Trello.token() + "/webhooks",
    function(webhooks) {
      $.each(webhooks, function(idx, webhook) {
        alert(webhook.callbackURL);
      });
    },
    function() { });
};
var onDenied = function() {
  alert("error");
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

    $("#add_webhook").submit(function(e) {
      if (Trello.authorized()) {
        var webhook_uri = $("#webhook_uri").val();
        var board_id = $("#boards option:selected").val();
        // TODO: check
        Trello.post("tokens/" + Trello.token() + "/webhooks", {
            description: "idobata",
            callbackURL: webhook_uri,
            idModel: board_id
          },
          function() {
            alert("Added");
          },
          function() {
            alert("Failed");
          }
        );
      }
      e.preventDefault();
    });
});
