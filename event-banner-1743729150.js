/**
 * Cafe24 이벤트 배너 스크립트
 * GitHub 저장소와 jsDelivr CDN을 통해 제공
 * 버전 기반 URL 적용
 */

(function() {
  // 디버깅 모드 활성화
  const DEBUG = true;
  
  // 로그 함수
  function log(message) {
    if (DEBUG && window.console && console.log) {
      console.log("[Event Banner]", message);
    }
  }

  // 배너 컨테이너 생성 또는 찾기
  function createBannerContainer() {
    let container = document.getElementById("cafe24-event-banner");
    
    if (!container) {
      container = document.createElement("div");
      container.id = "cafe24-event-banner";
      container.style.width = "100%";
      container.style.boxSizing = "border-box";
      container.style.zIndex = "1000";
      container.style.position = "relative";
      
      // 페이지 상단에 배너 삽입
      const firstChild = document.body.firstChild;
      document.body.insertBefore(container, firstChild);
    }
    
    return container;
  }

  // 기본 설정값
  const defaultSettings = {
    version: "1.0.0",
    lastUpdated: new Date().toISOString(),
    title: "특별 이벤트 진행 중!",
    message: "지금 구매하시면 30% 할인 혜택을 드립니다. 이 기회를 놓치지 마세요!",
    backgroundColor: "#4a90e2",
    textColor: "#ffffff",
    showButton: true,
    buttonText: "지금 구매하기",
    buttonColor: "#ff6b6b",
    buttonLink: "https://example.com/event",
    active: true
  };

  // 최신 버전 확인
  function checkLatestVersion() {
    return new Promise((resolve, reject) => {
      // 캐시를 방지하기 위한 타임스탬프 추가
      const timestamp = new Date().getTime();
      const versionUrl = `https://cdn.jsdelivr.net/gh/minjin-a/cafe24-banner@main/version.json?_=${timestamp}`;
      
      log("버전 확인 중: " + versionUrl);
      
      fetch(versionUrl)
        .then(response => {
          if (!response.ok) {
            throw new Error("버전 정보를 가져올 수 없습니다. 상태 코드: " + response.status);
          }
          return response.json();
        })
        .then(data => {
          log("최신 버전 확인: " + data.current_version);
          resolve(data.current_version);
        })
        .catch(error => {
          log("버전 확인 오류: " + error.message);
          
          // 오류 발생 시 로컬 스토리지에서 버전 확인
          try {
            const savedVersion = localStorage.getItem("cafe24_banner_version");
            if (savedVersion) {
              log("로컬 스토리지에서 버전 찾음: " + savedVersion);
              resolve(savedVersion);
              return;
            }
          } catch (e) {
            log("로컬 스토리지 접근 오류: " + e.message);
          }
          
          // 로컬 스토리지에도 없으면 기본 버전 사용
          log("기본 버전 사용: " + defaultSettings.version);
          resolve(defaultSettings.version);
        });
    });
  }

  // 설정 파일 로드 - 버전 기반 URL 사용
  function loadSettings(version) {
    log("설정 파일을 로드합니다... 버전: " + version);
    
    return new Promise((resolve, reject) => {
      // 먼저 로컬 스토리지에서 설정 확인
      try {
        const savedSettings = localStorage.getItem("cafe24_banner_settings");
        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          const savedVersion = localStorage.getItem("cafe24_banner_version");
          
          // 저장된 버전이 요청한 버전과 일치하면 사용
          if (savedVersion === version.toString()) {
            log("로컬 스토리지에서 설정 로드 성공: 버전 " + version);
            resolve(settings);
            return;
          }
        }
      } catch (e) {
        log("로컬 스토리지 접근 오류: " + e.message);
      }
      
      // 버전이 지정된 설정 파일 URL (버전 기반 URL 사용)
      const settingsUrl = `https://cdn.jsdelivr.net/gh/minjin-a/cafe24-banner@main/settings-${version}.json`;
      
      log("설정 URL: " + settingsUrl);
      
      fetch(settingsUrl)
        .then(response => {
          if (!response.ok) {
            throw new Error("설정 파일을 로드할 수 없습니다. 상태 코드: " + response.status);
          }
          return response.json();
        })
        .then(settings => {
          log("설정 파일 로드 성공: 버전 " + settings.version);
          
          // 로컬 스토리지에 현재 버전 저장
          try {
            localStorage.setItem("cafe24_banner_version", version);
            localStorage.setItem("cafe24_banner_settings", JSON.stringify(settings));
            log("로컬 스토리지에 설정 저장 완료: 버전 " + version);
          } catch (e) {
            log("로컬 스토리지 저장 오류: " + e.message);
          }
          
          resolve(settings);
        })
        .catch(error => {
          log("설정 파일 로드 오류: " + error.message);
          
          // 일반 설정 파일 시도
          log("일반 설정 파일 시도...");
          const generalSettingsUrl = `https://cdn.jsdelivr.net/gh/minjin-a/cafe24-banner@main/settings.json`;
          
          return fetch(generalSettingsUrl)
            .then(response => {
              if (!response.ok) {
                throw error; // 원래 오류 유지
              }
              return response.json();
            })
            .then(settings => {
              log("일반 설정 파일 로드 성공");
              
              // 로컬 스토리지에 저장
              try {
                localStorage.setItem("cafe24_banner_version", version);
                localStorage.setItem("cafe24_banner_settings", JSON.stringify(settings));
              } catch (e) {
                log("로컬 스토리지 저장 오류: " + e.message);
              }
              
              resolve(settings);
            })
            .catch(() => {
              // 모든 시도 실패 시 기본 설정 사용
              log("모든 로드 시도 실패, 기본 설정 사용");
              const settings = { ...defaultSettings, version: version };
              
              // 로컬 스토리지에 저장
              try {
                localStorage.setItem("cafe24_banner_version", version);
                localStorage.setItem("cafe24_banner_settings", JSON.stringify(settings));
              } catch (e) {
                log("로컬 스토리지 저장 오류: " + e.message);
              }
              
              resolve(settings);
            });
        });
    });
  }

  // 배너 렌더링 함수
  function renderBanner(settings) {
    log("배너 렌더링 시작: 버전 " + settings.version);
    
    // 배너가 비활성화된 경우 표시하지 않음
    if (!settings.active) {
      log("배너가 비활성화되어 있습니다.");
      return;
    }
    
    const container = createBannerContainer();
    
    // 배너 HTML 생성
    const bannerHTML = `
      <div class="event-banner" style="background-color: ${settings.backgroundColor}; color: ${settings.textColor}; padding: 15px; border-radius: 6px; text-align: center;">
        <h2 style="margin-top: 0; margin-bottom: 10px; font-size: 18px;">${settings.title}</h2>
        <p style="margin-bottom: 15px;">${settings.message}</p>
        ${settings.showButton ? `<button style="background-color: ${settings.buttonColor}; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer;">${settings.buttonText}</button>` : ''}
        <div style="font-size: 12px; margin-top: 10px;">
          버전: ${settings.version} | 마지막 업데이트: ${settings.lastUpdated}
        </div>
      </div>
    `;
    
    // 배너 컨테이너에 HTML 삽입
    container.innerHTML = bannerHTML;
    
    // 버튼 이벤트 리스너 추가
    if (settings.showButton) {
      const button = container.querySelector("button");
      if (button) {
        button.addEventListener("click", function() {
          if (settings.buttonLink) {
            window.location.href = settings.buttonLink;
          }
        });
      }
    }
    
    log("배너가 성공적으로 렌더링되었습니다. (버전: " + settings.version + ")");
    
    // 커스텀 이벤트 발생 - 배너 업데이트 완료
    const event = new CustomEvent("bannerUpdated", { detail: { version: settings.version } });
    document.dispatchEvent(event);
  }

  // 오류 배너 렌더링 함수
  function renderErrorBanner(errorMessage) {
    const container = createBannerContainer();
    
    const errorHTML = `
      <div style="background-color: #f8d7da; color: #721c24; padding: 15px; border-radius: 6px; text-align: center;">
        <h2 style="margin-top: 0; margin-bottom: 10px; font-size: 18px;">배너 로드 오류</h2>
        <p>${errorMessage}</p>
      </div>
    `;
    
    container.innerHTML = errorHTML;
    log("배너 렌더링 오류: " + errorMessage);
  }

  // 메인 함수
  function init() {
    log("배너 초기화 중...");
    
    // 최신 버전 확인 후 설정 로드 및 배너 렌더링
    checkLatestVersion()
      .then(version => {
        log("최신 버전: " + version);
        return loadSettings(version);
      })
      .then(settings => {
        renderBanner(settings);
      })
      .catch(error => {
        log("초기화 오류: " + error.message);
        renderErrorBanner("배너를 로드할 수 없습니다: " + error.message);
      });
  }

  // 페이지 로드 시 초기화
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();