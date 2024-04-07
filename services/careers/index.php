<!DOCTYPE html>
<html lang="en" class="h-100 w-100" ng-app="careers">
  <?php
    $title = "Agile Sense | Careers";
    include_once "../common/config.php";
    include ROOT."header.php";
  ?>

  <body class="h-100 w-100">

    <?php include ROOT."nav.php"; ?>

    <div ui-view></div>

    <?php include ROOT."footer.php"; ?>
  </body>
</html>
