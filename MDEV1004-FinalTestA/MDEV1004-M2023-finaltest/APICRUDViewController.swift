//
//  APICRUDViewController.swift
//  MDEV1004-M2023-Finaltest
//
//  Created by namrata savaliya on 2023-08-18.
//
import UIKit

class APICRUDViewController: UIViewController, UITableViewDelegate, UITableViewDataSource
{
    @IBOutlet weak var tableView: UITableView!
        
    var famouspeople: [FamousPeople] = []
    
    override func viewDidLoad()
    {
        super.viewDidLoad()
        
        fetchFamouspeople { [weak self] famouspeople, error in
            DispatchQueue.main.async
            {
                if let famouspeople = famouspeople
                {
                    if famouspeople.isEmpty
                    {
                        // Display a message for no data
                        self?.displayErrorMessage("No famouspeople available.")
                    } else {
                        self?.famouspeople = famouspeople
                        self?.tableView.reloadData()
                    }
                } else if let error = error {
                    if let urlError = error as? URLError, urlError.code == .timedOut
                    {
                        // Handle timeout error
                        self?.displayErrorMessage("Request timed out.")
                    } else {
                        // Handle other errors
                        self?.displayErrorMessage(error.localizedDescription)
                    }
                }
            }
        }
    }
    
    func displayErrorMessage(_ message: String)
    {
        let alertController = UIAlertController(title: "Error", message: message, preferredStyle: .alert)
        alertController.addAction(UIAlertAction(title: "OK", style: .default, handler: nil))
        present(alertController, animated: true, completion: nil)
    }
    
    func fetchFamouspeople(completion: @escaping ([FamousPeople]?, Error?) -> Void)
    {
        // Retrieve AuthToken from UserDefaults
        guard let authToken = UserDefaults.standard.string(forKey: "AuthToken") else
        {
            print("AuthToken not available.")
            completion(nil, nil)
            return
        }
        
        // Configure Request
        guard let url = URL(string: "https://mdev1004-finaltestlivesite.onrender.com/api/list") else
        {
            print("URL Error")
            completion(nil, nil) // Handle URL error
            return
        }
        
        var request = URLRequest(url: url)
            request.httpMethod = "GET"
            request.setValue("Bearer \(authToken)", forHTTPHeaderField: "Authorization")

        // Issue Request
        URLSession.shared.dataTask(with: request) { data, _, error in
            if let error = error {
                print("Network Error")
                completion(nil, error) // Handle network error
                return
            }

            guard let data = data else {
                print("Empty Response")
                completion(nil, nil) // Handle empty response
                return
            }

            // Response
            do {
                print("Decoding JSON Data...")
                let json = try JSONSerialization.jsonObject(with: data, options: []) as? [String: Any]

                if let success = json?["success"] as? Bool, success == true
                {
                    if let famouspeopleData = json?["data"] as? [[String: Any]]
                    {
                        let famouspeopleData = try JSONSerialization.data(withJSONObject: famouspeopleData, options: [])
                        let decodedFamouspeopleData = try JSONDecoder().decode([FamousPeople].self, from: famouspeopleData)
                        completion(decodedFamouspeopleData, nil) // Success
                    } else {
                        print("Missing 'data' field in JSON response")
                        completion(nil, nil) // Handle missing data field
                    }
                } else {
                    print("API request unsuccessful")
                    let errorMessage = json?["msg"] as? String ?? "Unknown error"
                    let error = NSError(domain: "", code: 0, userInfo: [NSLocalizedDescriptionKey: errorMessage])
                    completion(nil, error) // Handle API request unsuccessful
                }
            } catch {
                print("Error Decoding JSON Data")
                completion(nil, error) // Handle JSON decoding error
            }
        }.resume()
    }


    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int
    {
        return famouspeople.count
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell
    {
        let cell = tableView.dequeueReusableCell(withIdentifier: "MovieCell", for: indexPath) as! FamouspeopleTableViewCell
                        
                
        let famouspeople = famouspeople[indexPath.row]
                        
        
        
        cell.titleLabel?.text = famouspeople.name

        return cell
    }
    
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath)
    {
        performSegue(withIdentifier: "AddEditSegue", sender: indexPath)
    }
        
    // Swipe Left Gesture
    func tableView(_ tableView: UITableView, commit editingStyle: UITableViewCell.EditingStyle, forRowAt indexPath: IndexPath)
        {
            if editingStyle == .delete
                {
                    let famouspeople = famouspeople[indexPath.row]
                    ShowDeleteConfirmationAlert(for: famouspeople) { confirmed in
                        if confirmed
                        {
                            self.deleteMovie(at: indexPath)
                        }
                    }
                }
        }
    
    @IBAction func AddButton_Pressed(_ sender: UIButton)
    {
        performSegue(withIdentifier: "AddEditSegue", sender: nil)
    }
    
    override func prepare(for segue: UIStoryboardSegue, sender: Any?)
    {
        if segue.identifier == "AddEditSegue"
        {
            if let addEditVC = segue.destination as? AddEditAPICRUDViewController
            {
                addEditVC.crudViewController = self
                if let indexPath = sender as? IndexPath
                {
                   // Editing existing movie
                   let famouspeople = famouspeople[indexPath.row]
                   addEditVC.famouspeople = famouspeople
                } else {
                    // Adding new movie
                    addEditVC.famouspeople = nil
                }
                
                // Set the callback closure to reload movies
                addEditVC.famouspeopleUpdateCallback = { [weak self] in
                    self?.fetchFamouspeople { famouspeople, error in
                        if let famouspeople = famouspeople
                        {
                            self?.famouspeople = famouspeople
                            DispatchQueue.main.async {
                                self?.tableView.reloadData()
                            }
                        }
                        else if let error = error
                        {
                            print("Failed to fetch famouspeople: \(error)")
                        }
                    }
                }
            }
        }
    }
    
    func ShowDeleteConfirmationAlert(for famouspeople:
                                     FamousPeople, completion: @escaping (Bool) -> Void)
    {
        let alert = UIAlertController(title: "Delete people", message: "Are you sure you want to delete this people?", preferredStyle: .alert)
        
        alert.addAction(UIAlertAction(title: "Cancel", style: .cancel) { _ in
            completion(false)
        })
        
        alert.addAction(UIAlertAction(title: "Delete", style: .destructive) { _ in
            completion(true)
        })
        
        present(alert, animated: true, completion: nil)
    }
    
    func deleteMovie(at indexPath: IndexPath)
    {
        let famouspeople = famouspeople[indexPath.row]
        
        guard let authToken = UserDefaults.standard.string(forKey: "AuthToken") else
        {
                    print("AuthToken not available.")
                    return
        }

        guard let url = URL(string: "https://mdev1004-finaltestlivesite.onrender.com/api/delete/\(famouspeople._id)") else {
            print("Invalid URL")
            return
        }

        var request = URLRequest(url: url)
        request.httpMethod = "DELETE"
        
        request.setValue("Bearer \(authToken)", forHTTPHeaderField: "Authorization")

        let task = URLSession.shared.dataTask(with: request) { [weak self] data, response, error in
            if let error = error {
                print("Failed to delete movie: \(error)")
                return
            }

            DispatchQueue.main.async {
                self?.famouspeople.remove(at: indexPath.row)
                self?.tableView.deleteRows(at: [indexPath], with: .fade)
            }
        }
            
        task.resume()
    }
   
    @IBAction func logoutButtonPressed(_ sender: UIButton)
    {
        // Remove the token from UserDefaults or local storage to indicate logout
        UserDefaults.standard.removeObject(forKey: "AuthToken")
        
        // Clear the username and password in the LoginViewController
        APILoginViewController.shared?.ClearLoginTextFields()
        
        // unwind
        performSegue(withIdentifier: "unwindToLogin", sender: self)
    }

}
