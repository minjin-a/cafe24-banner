/**
 * Cafe24 이벤트 배너 스크립트
 * GitHub 저장소와 jsDelivr CDN을 통해 제공
 * 버전: 1.0.0
 */

;(() => {
  // 로그 함수
  function log(message) {
    if (window.console && console.log) {
      console.log("[Event Banner]", message)
    }
  }

  // 배너 컨테이너 생성 또는 찾기
  function createBannerContainer() {
    let container = document.getElementById("cafe24-event-banner")

    if (!container) {
      container = document.createElement("div")
      container.id = "cafe24-event-banner"
      container.style.width = "100%"
      container.style.boxSizing = "border-box"
      container.style.zIndex = "1000"
      container.style.position = "relative"

      // 페이지 상단에 배너 삽입
      const firstChild = document.body.firstChild
      document.body.insertBefore(container, firstChild)
    }

    return container
  }

  // 설정 파일 로드
  function loadSettings() {
    log("설정 파일을 로드합니다...")

    // 캐시를 방지하기 위한 타임스탬프 추가
    const timestamp = new Date().getTime()
    const settingsUrl = `https://cdn.jsdelivr.net/gh/minjin-a/cafe24-banner@main/settings.json?_=${timestamp}`

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open("GET", settingsUrl, true)

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const settings = JSON.parse(xhr.responseText)
            log("설정 파일 로드 성공: 버전 " + settings.version)
            resolve(settings)
          } catch (e) {
            reject(new Error("설정 파일 파싱 오류: " + e.message))
          }
        } else {
          reject(new Error("설정 파일을 로드할 수 없습니다. 상태 코드: " + xhr.status))
        }
      }

      xhr.onerror = () => {
        reject(new Error("네트워크 오류가 발생했습니다."))
      }

      xhr.send()
    })
  }

  // 배너 렌더링 함수
  function renderBanner(settings) {
    // 배너가 비활성화된 경우 표시하지 않음
    if (!settings.active) {
      log("배너가 비활성화되어 있습니다.")
      return
    }

    const container = createBannerContainer()

    // 배너 HTML 생성
    const bannerHTML = `
            <div class="event-banner" style="background-color: ${settings.backgroundColor}; color: ${settings.textColor}; padding: 15px; border-radius: 6px; text-align: center;">
                <h2 style="margin-top: 0; margin-bottom: 10px; font-size: 18px;">${settings.title}</h2>
                <p style="margin-bottom: 15px;">${settings.message}</p>
                ${settings.showButton ? `<button style="background-color: ${settings.buttonColor}; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer;">${settings.buttonText}</button>` : ""}
                <div style="font-size: 12px; margin-top: 10px;">
                    버전: ${settings.version} | 마지막 업데이트: ${settings.lastUpdated}
                </div>
            </div>
        `

    // 배너 컨테이너에 HTML 삽입
    container.innerHTML = bannerHTML

    // 버튼 이벤트 리스너 추가
    if (settings.showButton) {
      const button = container.querySelector("button")
      if (button) {
        button.addEventListener("click", () => {
          if (settings.buttonLink) {
            window.location.href = settings.buttonLink
          }
        })
      }
    }

    log("배너가 성공적으로 렌더링되었습니다. (버전: " + settings.version + ")")
  }

  // 오류 배너 렌더링 함수
  function renderErrorBanner(errorMessage) {
    const container = createBannerContainer()

    const errorHTML = `
            <div style="background-color: #f8d7da; color: #721c24; padding: 15px; border-radius: 6px; text-align: center;">
                <h2 style="margin-top: 0; margin-bottom: 10px; font-size: 18px;">배너 로드 오류</h2>
                <p>${errorMessage}</p>
            </div>
        `

    container.innerHTML = errorHTML
    log("배너 렌더링 오류: " + errorMessage)
  }

  // 메인 함수
  function init() {
    loadSettings()
      .then(renderBanner)
      .catch((error) => {
        log("오류 발생: " + error.message)
        renderErrorBanner(error.message)
      })
  }

  // 페이지 로드 시 초기화
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init)
  } else {
    init()
  }
})()

