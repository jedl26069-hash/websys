document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm")
  const registerForm = document.getElementById("registerForm")
  const messageDiv = document.getElementById("message")

  function showMessage(msg, type) {
    if (!messageDiv) return
    messageDiv.textContent = msg
    messageDiv.className = `message ${type}`
    messageDiv.style.display = "block"

    // Auto-hide after 5 seconds
    setTimeout(() => {
      messageDiv.style.display = "none"
    }, 5000)
  }

  document.querySelectorAll(".password-toggle").forEach((button) => {
    button.addEventListener("click", function () {
      const targetId = this.getAttribute("data-target")
      const input = document.getElementById(targetId)
      const eyeIcon = this.querySelector(".eye-icon")
      const eyeOffIcon = this.querySelector(".eye-off-icon")

      if (input.type === "password") {
        input.type = "text"
        eyeIcon.classList.add("hidden")
        eyeOffIcon.classList.remove("hidden")
      } else {
        input.type = "password"
        eyeIcon.classList.remove("hidden")
        eyeOffIcon.classList.add("hidden")
      }
    })
  })

  if (loginForm) {
    const savedEmail = sessionStorage.getItem("auth_email")
    const savedPass = sessionStorage.getItem("auth_password")

    if (savedEmail) {
      const emailInput = loginForm.querySelector('input[name="email"]')
      if (emailInput) emailInput.value = savedEmail
      sessionStorage.removeItem("auth_email") // Clear after use
    }

    if (savedPass) {
      const passInput = loginForm.querySelector('input[name="password"]')
      if (passInput) passInput.value = savedPass
      sessionStorage.removeItem("auth_password") // Clear after use
    }

    // If we auto-filled, we can optionally show a message
    if (savedEmail) {
      showMessage("Account created! Please sign in.", "success")
    }

    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault()
      const formData = new FormData(loginForm)
      // Add action type manually since we're using the same endpoint logic structure
      formData.append("action", "login")

      try {
        const response = await fetch("", {
          // Post to self
          method: "POST",
          body: formData,
        })

        const data = await response.json()

        if (data.status === "success") {
          showMessage("Login successful! Redirecting...", "success")
          setTimeout(() => {
            window.location.href = "/mysystem/"
          }, 1000)
        } else {
          showMessage(data.message || "Login failed", "error")
        }
      } catch (error) {
        console.error("Error:", error)
        showMessage("An error occurred. Please try again.", "error")
      }
    })
  }

  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault()

      const passwordInput = registerForm.querySelector('input[name="password"]')
      const password = passwordInput.value
      // At least 8 chars, 1 uppercase, 1 number, 1 special char
      const strictRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/

      if (!strictRegex.test(password)) {
        showMessage("Password must be 8+ chars, with 1 uppercase, 1 number, and 1 special char.", "error")
        return
      }

      const formData = new FormData(registerForm)
      formData.append("action", "register")

      try {
        const response = await fetch("", {
          // Post to self
          method: "POST",
          body: formData,
        })

        const data = await response.json()

        if (data.status === "success") {
          sessionStorage.setItem("auth_email", formData.get("email"))
          sessionStorage.setItem("auth_password", formData.get("password"))

          showMessage("Registration successful! Redirecting to login...", "success")
          setTimeout(() => {
            window.location.href = "login.php"
          }, 1500)
        } else {
          showMessage(data.message || "Registration failed", "error")
        }
      } catch (error) {
        console.error("Error:", error)
        showMessage("An error occurred. Please try again.", "error")
      }
    })
  }
})
