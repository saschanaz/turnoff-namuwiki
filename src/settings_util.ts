let config: ConfigInterface;
const bgconsole = browser.extension.getBackgroundPage().console;

function escapeHtml(unsafe: string) {
  return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
}

function showVersion() {
  const manifestData = browser.runtime.getManifest();
  document.getElementById('extension_version').innerHTML = escapeHtml("ver." + manifestData.version);
  document.getElementById('extension_version').addEventListener("click", (e) => {
    fetch(browser.extension.getURL('production_ver.txt')).then(
      (data) => {
        if (data.status === 200) {
          document.getElementById('extension_version').innerHTML = escapeHtml("Prod. "+data.body);

          setTimeout(
            () => {
                document.getElementById('extension_version').innerHTML = escapeHtml("ver." + manifestData.version);
            }, 2000
          )
        } else {
          document.getElementById('extension_version').innerHTML = escapeHtml("Dev ver.");

          setTimeout(
            () => {
                document.getElementById('extension_version').innerHTML = escapeHtml("ver." + manifestData.version);
            }, 2000
          )
        }
      });
  });
}


function setHook(chkbox: HTMLInputElement[], callback?: (config: ConfigInterface) => any) {
    for (const chk of chkbox) {
        const datasetVal = chk.dataset.val as keyof ConfigInterface;
        if (chk.type === "checkbox") {
            chk.checked = config[datasetVal] as boolean;
        } else if (chk.type === "text" || chk.type === "url") {
            chk.value = ((typeof (config[datasetVal]) === "undefined") ? '' : config[datasetVal]) as string;
        }
        chk.addEventListener(
            "change",
            async () => {
                if (chk.type === "checkbox") {
                    (config[datasetVal] as boolean) = chk.checked;
                } else if (chk.type === "text" || chk.type === "url") {
                    (config[datasetVal] as string) = chk.value;
                }
                await saveData(config);
                if (typeof callback !== "undefined") callback(config as ConfigInterface);
            }
        )
    }
}

async function updateIntelliBan(config: ConfigInterface, url?: string) {
    if (typeof url === "undefined") {
        if (typeof config.intelliBanUrl === "undefined") {
            config.intelliBanUrl = "/intelliBan/rules.json";
            url = config.intelliBanUrl;
        } else {
            url = config.intelliBanUrl
        }
    }

    const data = await fetch(config.intelliBanUrl);
    if (data.status === 200) {
      const json = await data.json();
      config.intelliBanRules = json;
    }

    saveData(config);
}

async function saveData(thisConfig: ConfigInterface) {
    try {
        await browser.storage.sync.set(thisConfig as any);
        bgconsole.log(`저장 완료. ${JSON.stringify(config)}`);
    } catch (e) {
        bgconsole.error(`저장 실패. ${JSON.stringify(config)}`);
    }
}
