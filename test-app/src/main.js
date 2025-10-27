const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("node:path");

app.disableHardwareAcceleration(); // Disable GPU acceleration

//--------------------------------------------------------------------------------------------------
// ROS 2 Setup Stuff
// const rclnodejs = require('rclnodejs');
// let node = null;
let publisher_light, publisher_brake, publisher_lidar, publisher_selfdrive;

// Track current status of each system
let systemStatus = {
  light: 'OFF',
  brake: 'ON',
  lidar: 'OFF',
  selfdrive: 'OFF'
};

async function initROS() {
  console.log('ROS initialization disabled for testing');
  // All ROS functionality is commented out since rclnodejs is not available
  // await rclnodejs.init();

  // Create node
  // node = new rclnodejs.Node('electron_node');

  //--------------------------------------------------------------------------
  // Create publishers
  // const message_string = "std_msgs/msg/String";
  // const message_int = "std_msgs/msg/Int32";

  // const topic_light = "electron_light";
  // publisher_light = node.createPublisher(message_string, topic_light);

  // const topic_brake = "electron_brake";
  // publisher_brake = node.createPublisher(message_string, topic_brake);

  // const topic_lidar = "electron_lidar";
  // publisher_lidar = node.createPublisher(message_string, topic_lidar);

  // const topic_selfdrive = "electron_selfdrive";
  // publisher_selfdrive = node.createPublisher(message_int, topic_selfdrive);

  // const topic_room = "electron_room";
  // publisher_room = node.createPublisher(message_int, topic_room);

  //--------------------------------------------------------------------------
  // Create subscribers
  // const topic_battery = "electron_battery";
  // node.createSubscription(message_string, topic_battery, (msg) => {
  //   console.log(`Received from Jetson: ${msg.data}`);
  //   temp = "BATTERY_" + msg.data;
  //   if (mainWindow && !mainWindow.isDestroyed() && mainWindow.webContents) {
  //     mainWindow.webContents.send("update-display", temp);
  //   }
  // });

  // const topic_speed = "electron_speed";
  // node.createSubscription(message_string, topic_speed, (msg) => {
  //   console.log(`Received from Jetson: ${msg.data}`);
  //   temp = "SPEED_" + msg.data;
  //   if (mainWindow && !mainWindow.isDestroyed() && mainWindow.webContents) {
  //     mainWindow.webContents.send("update-display", temp);
  //   }
  // });

  // node.spin();
  // console.log(`Created all publishers and subscribers. Waiting...`);

  // defaultPublish();
  // console.log(`Published default values. Waiting...`);
}

//--------------------------------------------------------------------------------------------------
function defaultPublish() {
  if (!publisher_light || !publisher_brake || !publisher_lidar || !publisher_selfdrive) {
    console.log('Publishers not initialized, skipping defaultPublish');
    // Send default status to UI even without ROS
    sendStatusToUI();
    return;
  }

  let temp = "LIGHT_OFF";
  publisher_light.publish({ data: temp });
  console.log(`---> Published from Electron app: ${temp}`);

  temp = "BRAKE_ON";
  publisher_brake.publish({ data: temp });
  console.log(`---> Published from Electron app: ${temp}`);

  temp = "LIDAR_OFF";
  publisher_lidar.publish({ data: temp });
  console.log(`---> Published from Electron app: ${temp}`);

  temp = 0;
  publisher_selfdrive.publish({ data: temp });
  console.log(`---> Published from Electron app: ${temp}`);

  sendStatusToUI();
}

function sendStatusToUI() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    // Send individual status updates
    mainWindow.webContents.send("update-display", `LIGHT_${systemStatus.light}`);
    mainWindow.webContents.send("update-display", `BRAKE_${systemStatus.brake}`);
    mainWindow.webContents.send("update-display", `LIDAR_${systemStatus.lidar}`);
    mainWindow.webContents.send("update-display", `SELFDRIVE_${systemStatus.selfdrive}`);
  }
}

//--------------------------------------------------------------------------------------------------
// Window functionality
let mainWindow;
let lockWindow;
let isShuttingDown = false;
let actualShutdown = true;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 970,
    height: 750,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    mainWindow.loadURL('http://localhost:8080');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
  mainWindow.maximize();

  mainWindow.on("close", (event) => {
    if (!actualShutdown) {
      return;
    }

    shutdownApp();
  });
}

//--------------------------------------------------------------------
// Cleanup function
async function shutdownApp() {
  if (!actualShutdown || isShuttingDown) return;
  isShuttingDown = true;

  console.log("Shutting down application...");

  if (node) {
    try {
      node.destroy();
    } catch (err) {
      console.warn("Error destroying ROS node:", err);
    }
  }

  try {
    await rclnodejs.shutdown();
  } catch (err) {
    console.warn("Error during ROS shutdown:", err);
  }

  app.quit();
}

//--------------------------------------------------------------------------------------------------
// Interaction with render process
ipcMain.on("button-action", (event, action) => {
  console.log(`Received button action: ${action}`);

  // Lock Screen
  if (action == "LOCK") {
    // Send lock message to React app
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send("update-display", "LOCK");
    }
    defaultPublish();
  }

  // Publish to ROS 2 & send display updates
  if (
    action == "LIGHT_FLASHING" ||
    action == "LIGHT_STEADY" ||
    action == "LIGHT_OFF"
  ) {
    systemStatus.light = action.replace('LIGHT_', '');
    if (publisher_light) {
      publisher_light.publish({ data: action });
      console.log(`---> Published from Electron app: ${action}`);
    }
  }

  if (action == "BRAKE_ON" || action == "BRAKE_OFF") {
    systemStatus.brake = action.replace('BRAKE_', '');
    if (publisher_brake) {
      publisher_brake.publish({ data: action });
      console.log(`---> Published from Electron app: ${action}`);
    }
  }

  if (action == "LIDAR_ON" || action == "LIDAR_OFF") {
    systemStatus.lidar = action.replace('LIDAR_', '');
    if (publisher_lidar) {
      publisher_lidar.publish({ data: action });
      console.log(`---> Published from Electron app: ${action}`);
    }
  }

  //-------------------------------------------------------------------------
  // Self-drive Actions
  if (action == "SELFDRIVE_FULL") {
    // Self-drive full
    systemStatus.selfdrive = 'FULL';
    const msg = { data: 2 };
    if (publisher_selfdrive) {
      publisher_selfdrive.publish(msg);
      console.log(`---> Published from Electron app: ${msg.data}`);
    }
  } else if (action == "SELFDRIVE_JOYSTICK") {
    // Self-drive w/Joystick
    systemStatus.selfdrive = 'JOYSTICK';
    const msg = { data: 1 };
    if (publisher_selfdrive) {
      publisher_selfdrive.publish(msg);
      console.log(`---> Published from Electron app: ${msg.data}`);
    }
  } else if (action == "SELFDRIVE_OFF") {
    // Self-drive off
    systemStatus.selfdrive = 'OFF';
    const msg = { data: 0 };
    if (publisher_selfdrive) {
      publisher_selfdrive.publish(msg);
      console.log(`---> Published from Electron app: ${msg.data}`);
    }
  }

  //-------------------------------------------------------------------------
  // Room destination actions
  if (action.startsWith("ROOM_")) {
    temp = action.substring(action.indexOf("_") + 1);
    const msg = { data: temp };
    if (publisher_room) {
      publisher_room.publish(msg);
      console.log(`---> Published from Electron app: ${msg.data}`);
    }
  }

  //-------------------------------------------------------------------------
  // Send action name for screen update
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("update-display", action);
  }
});

//------------------------------------------------------------
// Switching windows
// Unlock
ipcMain.on("send-password", (event, password) => {
  const ACTUAL_PASSWORD = 7034;
  if (password == ACTUAL_PASSWORD) {
    // Send navigation message to React app
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send("update-display", "NAVIGATE_TO_MAIN");
      // Send initial status after navigation
      setTimeout(() => {
        sendStatusToUI();
      }, 100);
    }
    defaultPublish();
  }
});

//--------------------------------------------------------------------------------------------------
// Other necessary stuff
app.whenReady().then(async () => {
  createWindow();
  initROS();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});
