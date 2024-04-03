
<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

if((isset($_GET["city_name"]))){
    $city_name = $_GET["city_name"];
}else{
    $city_name ="Haridwar";
}
function fetch_weather_data()
{
    global $city_name;
    $api_key = "cae6201b6cd9ee700bf84977a25d1c63";
    $url = "https://api.openweathermap.org/data/2.5/weather?q={$city_name}&appid={$api_key}&units=metric";

    $json_data = file_get_contents($url);

    $response_data = json_decode($json_data);

    if ($response_data === null || isset($response_data->cod) && $response_data->cod !== 200) {
        return false;
    }

    if ($response_data->cod === 200) {
        $day_of_week = date('D');
        $day_and_date = date('M j, Y');
        $weather_condition = $response_data->weather[0]->description;
        $weather_icon = $response_data->weather[0]->icon;
        $temperature = $response_data->main->temp;
        $pressure = $response_data->main->pressure;
        $wind_speed = $response_data->wind->speed;
        $humidity = $response_data->main->humidity;

        return [$day_of_week, $day_and_date, $weather_condition, $weather_icon, $temperature, $pressure, $wind_speed, $humidity];
    } else {
        echo "Error: Unable to fetch weather data.";
    }
}

function create_DB($servername, $username, $password, $dbname)
{
    $conn = new mysqli($servername, $username, $password);

    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }

    $sql = "CREATE DATABASE IF NOT EXISTS $dbname";
    if ($conn->query($sql) !== TRUE) {
        echo "Error creating database: " . $conn->error;
    }

    $conn->close();
}

function create_table($servername, $username, $password, $dbname)
{
    global $city_name;

    $conn = new mysqli($servername, $username, $password, $dbname);

    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }

    $sql = "CREATE TABLE if not exists $city_name(
        id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        Day_of_Week VARCHAR(15),
        Day_and_Date VARCHAR(20),
        Weather_Condition VARCHAR(50),
        Weather_Icon VARCHAR(100),
        Temperature INT(5),
        Pressure INT(6),
        Wind_Speed DECIMAL(5, 2),
        Humidity INT(5)
    )";

    if ($conn->query($sql) !== TRUE) {
        echo "Error creating table: " . $conn->error;
    }

    $conn->close();
}

function insert_update_data($servername, $username, $password, $dbname)
{
    global $city_name;
    $conn = new mysqli($servername, $username, $password, $dbname);

    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }

    list($day_of_week, $day_and_date, $weather_condition, $weather_icon, $temperature, $pressure, $wind_speed, $humidity) = fetch_weather_data();

    $existing_sql = "SELECT * FROM $city_name WHERE Day_of_Week = '$day_of_week'";
    $existing_result = $conn->query($existing_sql);

    if ($existing_result->num_rows === 0) {
        $insert_sql = "INSERT INTO $city_name (Day_of_Week, Day_and_Date, Weather_Condition, Weather_Icon, Temperature, Pressure, Wind_Speed, Humidity)
                  VALUES ('$day_of_week', '$day_and_date', '$weather_condition', '$weather_icon', $temperature, $pressure, $wind_speed, $humidity)";

        if ($conn->query($insert_sql) !== TRUE) {
            echo "Error: " . $insert_sql . "<br>" . $conn->error;
        }
    } else {
        $update_sql = "UPDATE $city_name 
              SET 
                Weather_Condition = '$weather_condition',
                Weather_Icon = '$weather_icon',
                Temperature = $temperature,
                Pressure = $pressure,
                Wind_Speed = $wind_speed,
                Humidity = $humidity,
                Day_and_Date = '$day_and_date'
              WHERE Day_of_Week = '$day_of_week'";

        if ($conn->query($update_sql) !== TRUE) {
            echo "Error: " . $update_sql . "<br>" . $conn->error;
        }
    }

    $conn->close();
}

function display_data($servername, $username, $password, $dbname)
{
    global $city_name;

    $conn = new mysqli($servername, $username, $password, $dbname);

    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }

    $sql = "SELECT * FROM $city_name ORDER BY FIELD(Day_of_Week, 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'), id ASC";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        $all_data = array();

        while ($row = $result->fetch_assoc()) {
            array_push($all_data, $row);
        }
        return json_encode($all_data);
    } else {
        echo "0 results";
    }

    $conn->close();
}

function connect_DB()
{
    $servername = "sql112.infinityfree.com";
    $username = "if0_35975930";
    $password = "sw14IBTN399v7c";
    $dbname = "if0_35975930_weatherapp";

    create_DB($servername, $username, $password, $dbname);
    create_table($servername, $username, $password, $dbname);
    insert_update_data($servername, $username, $password, $dbname);
    $json_data = display_data($servername, $username, $password, $dbname);

    return $json_data;
}

echo connect_DB();
?>
